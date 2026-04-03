/**
 * Public Consent API service. For external CMS / websites; uses API key auth.
 * All queries strictly tenant-scoped via req.tenant.id. Never expose tenant_id or client_id.
 */
const { Purpose, PolicyVersion, Tenant } = require('../models');
const auditService = require('./audit.service');
const consentService = require('./consent.service');
const consentReadService = require('./consentRead.service');
const { pseudonymizeIdentityPair } = require('../utils/pseudonymizeUserIdentifier');

/**
 * List active purposes for consent banner. Audit: PUBLIC_PURPOSE_LIST.
 */
async function listPurposes(tenantId, ipAddress = null) {
  const purposes = await Purpose.findAll({
    where: { tenant_id: tenantId, active: true },
    attributes: ['id', 'name', 'description', 'required', 'required_data', 'validity_days', 'permissions'],
    order: [['name', 'ASC']],
  });
  return purposes.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    required: p.required,
    required_data: Array.isArray(p.required_data) ? p.required_data : null,
    validity_days: p.validity_days ?? null,
    permissions: p.permissions || null,
  }));
}

/**
 * Get active policy version for app. Audit: PUBLIC_POLICY_READ.
 */
async function getActivePolicy(tenantId, appId, ipAddress = null) {
  const [row, tenant] = await Promise.all([
    PolicyVersion.findOne({
      where: { tenant_id: tenantId, app_id: appId, is_active: true },
      attributes: ['id', 'version_label', 'policy_text', 'effective_from'],
    }),
    Tenant.findByPk(tenantId, { attributes: ['consent_flow'] }),
  ]);
  if (!row) return null;
  return {
    id: row.id,
    version: row.version_label,
    policy_text: row.policy_text,
    effective_from: row.effective_from ? new Date(row.effective_from).toISOString().slice(0, 10) : null,
    consent_flow: tenant?.consent_flow || 'embedded',
  };
}

async function assertEmbeddedFlow(tenantId) {
  const tenant = await Tenant.findByPk(tenantId, { attributes: ['id', 'consent_flow'] });
  if (!tenant) {
    const err = new Error('Tenant not found');
    err.statusCode = 404;
    throw err;
  }
  if (tenant.consent_flow !== 'embedded') {
    const err = new Error('Embedded consent API is disabled for this tenant. Use redirect consent flow.');
    err.statusCode = 409;
    throw err;
  }
}

/**
 * Submit user consent for app. Delegates to consent.service with PUBLIC_CONSENT_GRANTED audit.
 */
async function grantConsent(tenantId, appId, body, ipAddress = null, options = {}) {
  if (!options.skipEmbeddedFlowCheck) {
    await assertEmbeddedFlow(tenantId);
  }
  const { userId, emailHash, phoneHash } = pseudonymizeIdentityPair(tenantId, body.email, body.phone_number);
  const purposeIds = Array.isArray(body.purpose_ids) && body.purpose_ids.length > 0
    ? body.purpose_ids
    : [body.purpose_id];
  const uniquePurposeIds = [...new Set(purposeIds.map((id) => String(id).trim()).filter(Boolean))];

  const consentIds = [];
  for (const purposeId of uniquePurposeIds) {
    const mapped = {
      userId,
      emailHash,
      phoneHash,
      purposeId,
      policyVersionId: body.policy_version_id,
    };
    const result = await consentService.grantConsent(tenantId, appId, null, mapped, ipAddress, {
      auditActionGranted: 'PUBLIC_CONSENT_GRANTED',
      source: options.source || 'public_api',
      verificationChannel: options.verificationChannel || 'sms',
      portalEmail: body.email,
      portalPhone: body.phone_number,
    });
    if (result.consentId) consentIds.push(result.consentId);
  }
  return {
    success: true,
    consentId: consentIds.length === 1 ? consentIds[0] : null,
    consentIds,
    purposesProcessed: uniquePurposeIds.length,
  };
}

/**
 * Withdraw consent for (user_id, purpose_id). App-scoped.
 */
async function withdrawConsent(tenantId, appId, body, ipAddress = null) {
  await assertEmbeddedFlow(tenantId);
  const { userId, emailHash } = pseudonymizeIdentityPair(tenantId, body.email, body.phone_number);
  const purposeIds = Array.isArray(body.purpose_ids) && body.purpose_ids.length > 0
    ? body.purpose_ids
    : [body.purpose_id];
  const uniquePurposeIds = [...new Set(purposeIds.map((id) => String(id).trim()).filter(Boolean))];

  const results = [];
  for (const purposeId of uniquePurposeIds) {
    const result = await consentService.withdrawConsent(
      tenantId,
      appId,
      userId,
      purposeId,
      null,
      ipAddress,
      { auditActionWithdrawn: 'PUBLIC_CONSENT_WITHDRAWN', emailHash, source: 'public_api' }
    );
    results.push({ purposeId, consentId: result.consentId, alreadyWithdrawn: Boolean(result.alreadyWithdrawn) });
  }
  return {
    success: true,
    consentId: results.length === 1 ? results[0].consentId : null,
    consentIds: results.map((r) => r.consentId),
    purposesProcessed: uniquePurposeIds.length,
    results,
  };
}

/**
 * Get current consent state for a user in an app using email+phone identity (API key route).
 */
async function getConsentStateByIdentity(tenantId, appId, body) {
  const { userId } = pseudonymizeIdentityPair(tenantId, body.email, body.phone_number);
  const consents = await consentReadService.getConsentStateDerived(tenantId, appId, userId);
  return { user_id: userId, consents };
}

module.exports = {
  listPurposes,
  getActivePolicy,
  grantConsent,
  withdrawConsent,
  getConsentStateByIdentity,
};
