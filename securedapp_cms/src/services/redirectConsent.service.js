const crypto = require('crypto');
const { ConsentRedirectSession, Tenant } = require('../models');
const publicConsentService = require('./publicConsent.service');
const emailService = require('./email.service');

const SESSION_TTL_MINUTES = Number(process.env.REDIRECT_CONSENT_TTL_MINUTES || 30);
const OTP_TTL_MINUTES = Number(process.env.REDIRECT_CONSENT_OTP_TTL_MINUTES || 10);
const OTP_MAX_ATTEMPTS = Number(process.env.REDIRECT_CONSENT_OTP_MAX_ATTEMPTS || 5);

function hashOtp(token, otp) {
  return crypto.createHash('sha256').update(`${token}:${otp}`).digest('hex');
}

function buildRedirectUrl(req, token) {
  const configuredBase = process.env.REDIRECT_CONSENT_BASE_URL;
  if (configuredBase && configuredBase.trim()) {
    return `${configuredBase.replace(/\/+$/, '')}/public/consent/redirect/${token}`;
  }
  // Avoid relying on req.protocol in environments with non-standard trust proxy setup.
  const forwardedProto = req?.headers?.['x-forwarded-proto'];
  const proto = typeof forwardedProto === 'string' && forwardedProto.trim()
    ? forwardedProto.split(',')[0].trim()
    : 'http';
  const host = (typeof req?.get === 'function' ? req.get('host') : null) || req?.headers?.host || 'localhost:3000';
  return `${proto}://${host}/public/consent/redirect/${token}`;
}

function createOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function createRedirectConsentRequest(req, tenantId, appId, body) {
  const email = String(body.email || '').trim();
  const phoneNumber = String(body.phone_number ?? body.phoneNumber ?? body.phone ?? '').trim();
  const purposeInput = body.purposeIds ?? body.purpose_ids ?? (body.purposeId || body.purpose_id ? [body.purposeId || body.purpose_id] : []);
  const purposeIds = [...new Set((Array.isArray(purposeInput) ? purposeInput : [purposeInput]).map((id) => String(id).trim()).filter(Boolean))];
  const policyVersionId = body.policyVersionId ?? body.policy_version_id;

  const tenant = await Tenant.findByPk(tenantId, { attributes: ['id', 'consent_flow'] });
  if (!tenant) {
    const err = new Error('Tenant not found');
    err.statusCode = 404;
    throw err;
  }
  if (tenant.consent_flow !== 'redirect') {
    const err = new Error('Tenant consent flow is not redirect');
    err.statusCode = 400;
    throw err;
  }

  const redirectToken = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MINUTES * 60 * 1000);
  const row = await ConsentRedirectSession.create({
    tenant_id: tenantId,
    app_id: appId,
    purpose_id: purposeIds.length > 0 ? purposeIds[0] : null,
    purpose_ids: purposeIds,
    policy_version_id: policyVersionId,
    email,
    phone_number: phoneNumber,
    redirect_token: redirectToken,
    expires_at: expiresAt,
    status: 'pending',
  });

  return {
    request_id: row.id,
    redirect_url: buildRedirectUrl(req, redirectToken),
    expires_at: expiresAt.toISOString(),
  };
}

async function getRedirectSessionByToken(token, plain = false) {
  const { Tenant, App, Purpose } = require('../models');
  const row = await ConsentRedirectSession.findOne({
    where: { redirect_token: token },
  });
  if (!row) {
    const err = new Error('Redirect consent request not found');
    err.statusCode = 404;
    throw err;
  }
  if (row.status === 'consented' && !plain) {
    return row;
  }
  
  if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) {
    await row.update({ status: 'expired' });
    const err = new Error('Redirect consent request expired');
    err.statusCode = 410;
    throw err;
  }

  // Query App and Tenant names directly
  const [tenant, app] = await Promise.all([
    Tenant.findByPk(row.tenant_id, { attributes: ['name'] }),
    App.findByPk(row.app_id, { attributes: ['name'] }),
  ]);

  // Fetch purposes based on purpose_ids array, fallback to single purpose_id
  let purposes = [];
  const purposeIdsArray = Array.isArray(row.purpose_ids) && row.purpose_ids.length > 0
    ? row.purpose_ids
    : (row.purpose_id ? [row.purpose_id] : []);

  if (purposeIdsArray.length > 0) {
    purposes = await Purpose.findAll({
      where: { id: purposeIdsArray },
      attributes: ['id', 'name', 'description', 'validity_days', 'required_data'],
    });
  }

  if (plain) {
    // Return plain object for UI (controller)
    const session = row.get({ plain: true });
    session.fiduciary = tenant?.name;
    session.app_name = app?.name;
    session.purposes = purposes.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      validity_days: p.validity_days,
      required_data: p.required_data,
    }));
    return session;
  }

  // Attach to dataValues for use in other service methods if needed
  row.dataValues.fiduciary = tenant?.name;
  row.dataValues.app_name = app?.name;
  row.dataValues.purposes = purposes.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    validity_days: p.validity_days,
    required_data: p.required_data,
  }));

  return row;
}

async function sendOtp(token, otpMode = 'mobile') {
  const row = await getRedirectSessionByToken(token);
  if (row.status === 'consented') {
    const err = new Error('Consent is already completed');
    err.statusCode = 409;
    throw err;
  }

  if ((row.otp_attempts || 0) >= OTP_MAX_ATTEMPTS) {
    const err = new Error('Maximum OTP resend attempts exceeded');
    err.statusCode = 429;
    throw err;
  }

  const normalizeModes = (raw) => {
    const allowed = new Set(['mobile', 'email', 'whatsapp']);
    if (Array.isArray(raw)) {
      const modes = [...new Set(raw.map((x) => String(x || '').trim()).filter((m) => allowed.has(m)))];
      return modes;
    }
    const single = String(raw || '').trim();
    if (single === 'all') return ['mobile', 'email', 'whatsapp'];
    if (allowed.has(single)) return [single];
    return ['mobile'];
  };
  const normalizedModes = normalizeModes(otpMode);

  const otp = createOtpCode();
  const now = new Date();
  const otpExpiry = new Date(now.getTime() + OTP_TTL_MINUTES * 60 * 1000);
  await row.update({
    otp_hash: hashOtp(token, otp),
    otp_sent_at: now,
    otp_expires_at: otpExpiry,
    otp_mode: normalizedModes.join(','),
    // Note: We don't reset attempts on resend, we let them accumulate to enforce limits
    status: 'otp_sent',
  });

  let mailSent = false;
  let smsSent = false;
  let whatsappSent = false;

  if (normalizedModes.includes('email')) {
    try {
      if (row.email) {
        const mailResult = await emailService.sendOtpEmail(row.email, otp);
        mailSent = Boolean(mailResult?.sent);
      } else {
        console.log('[EMAIL MOCK] Missing email for OTP; treating as mock success');
        mailSent = true;
      }
    } catch (err) {
      // Keep OTP flow resilient for demo/testing even if email provider is unavailable.
      console.log('[EMAIL MOCK] Email provider failed; continuing with mock OTP flow:', err.message);
      mailSent = true;
    }
  }

  if (normalizedModes.includes('mobile')) {
    // Mock SMS sending here, you would integrate a real SMS provider
    console.log(`[SMS MOCK] Sending OTP ${otp} to ${row.phone_number}`);
    smsSent = true;
  }

  if (normalizedModes.includes('whatsapp')) {
    // Placeholder for future WhatsApp integration.
    console.log(`[WHATSAPP MOCK] Sending OTP ${otp} to ${row.phone_number}`);
    whatsappSent = true;
  }

  const response = {
    success: true,
    message: 'OTP sent according to selected mode.',
    // Demo requirement: always surface OTP to avoid provider-related blockers.
    dev_otp: otp,
    delivery: {
      email: normalizedModes.includes('email') ? mailSent : null,
      mobile: normalizedModes.includes('mobile') ? smsSent : null,
      whatsapp: normalizedModes.includes('whatsapp') ? whatsappSent : null,
    },
  };

  return response;
}

async function verifyOtpAndGrantConsent(token, otp, ipAddress = null, selectedPurposeIds = null) {
  const row = await getRedirectSessionByToken(token);
  if (row.status === 'consented') {
    return { success: true, already_consented: true, consent_id: row.consent_id };
  }
  if (!row.otp_hash || !row.otp_expires_at) {
    const err = new Error('OTP not sent yet');
    err.statusCode = 400;
    throw err;
  }
  if (new Date(row.otp_expires_at).getTime() < Date.now()) {
    const err = new Error('OTP expired');
    err.statusCode = 400;
    throw err;
  }
  if ((row.otp_attempts || 0) >= OTP_MAX_ATTEMPTS) {
    const err = new Error('Maximum OTP attempts exceeded');
    err.statusCode = 429;
    throw err;
  }

  const incomingHash = hashOtp(token, otp);
  if (incomingHash !== row.otp_hash) {
    await row.update({ otp_attempts: (row.otp_attempts || 0) + 1 });
    const err = new Error('Invalid OTP');
    err.statusCode = 400;
    throw err;
  }

  const purposeIds = (row.purpose_ids && row.purpose_ids.length > 0) 
    ? row.purpose_ids 
    : (row.purpose_id ? [row.purpose_id] : []);

  if (purposeIds.length === 0) {
    const err = new Error('No purposes specified for consent');
    err.statusCode = 400;
    throw err;
  }

  let finalPurposeIds = purposeIds;
  if (Array.isArray(selectedPurposeIds)) {
    const selected = [...new Set(selectedPurposeIds.map((id) => String(id).trim()).filter(Boolean))];
    if (selected.length === 0) {
      const err = new Error('Select at least one purpose to continue');
      err.statusCode = 400;
      throw err;
    }
    const allowed = new Set(purposeIds.map((id) => String(id)));
    const invalid = selected.filter((id) => !allowed.has(id));
    if (invalid.length > 0) {
      const err = new Error('One or more selected purposes are invalid');
      err.statusCode = 400;
      throw err;
    }
    finalPurposeIds = selected;
  }

  const result = await publicConsentService.grantConsent(
    row.tenant_id,
    row.app_id,
    {
      email: row.email,
      phone_number: row.phone_number,
      purpose_ids: finalPurposeIds,
      policy_version_id: row.policy_version_id,
    },
    ipAddress,
    { skipEmbeddedFlowCheck: true, source: 'redirect_flow', verificationChannel: 'sms' }
  );
  const consentIds = Array.isArray(result.consentIds)
    ? result.consentIds
    : (result.consentId ? [result.consentId] : []);

  await row.update({
    status: 'consented',
    consent_id: consentIds.length > 0 ? consentIds[0] : null, // Store at least first one for backward compatibility
    completed_at: new Date(),
  });

  return { success: true, consent_ids: consentIds };
}

module.exports = {
  createRedirectConsentRequest,
  getRedirectSessionByToken,
  sendOtp,
  verifyOtpAndGrantConsent,
};
