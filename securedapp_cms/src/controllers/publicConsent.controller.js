const publicConsentService = require('../services/publicConsent.service');
const getClientIp = require('../utils/getClientIp');

async function getPurposes(req, res, next) {
  try {
    const purposes = await publicConsentService.listPurposes(req.tenant.id, getClientIp(req));
    res.status(200).json({ purposes });
  } catch (err) {
    next(err);
  }
}

async function getPolicy(req, res, next) {
  try {
    const appId = req.appId || req.params.appId;
    const policyVersion = await publicConsentService.getActivePolicy(req.tenant.id, appId, getClientIp(req));
    res.status(200).json({ policyVersion });
  } catch (err) {
    next(err);
  }
}

async function grantConsent(req, res, next) {
  try {
    const appId = req.appId || req.params.appId;
    const email = req.body.email ?? req.body.userEmail ?? req.body.user_email;
    const phoneNumber = req.body.phoneNumber ?? req.body.phone_number ?? req.body.phone;
    const rawPurposeIds = Array.isArray(req.body.purposeIds)
      ? req.body.purposeIds
      : (Array.isArray(req.body.purpose_ids) ? req.body.purpose_ids : null);
    const body = {
      email,
      phone_number: phoneNumber,
      purpose_id: req.body.purposeId ?? req.body.purpose_id,
      purpose_ids: rawPurposeIds,
      policy_version_id: req.body.policyVersionId ?? req.body.policy_version_id,
    };
    const result = await publicConsentService.grantConsent(req.tenant.id, appId, body, getClientIp(req));
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function withdrawConsent(req, res, next) {
  try {
    const appId = req.appId || req.params.appId;
    const email = req.body.email ?? req.body.userEmail ?? req.body.user_email;
    const phoneNumber = req.body.phoneNumber ?? req.body.phone_number ?? req.body.phone;
    const rawPurposeIds = Array.isArray(req.body.purposeIds)
      ? req.body.purposeIds
      : (Array.isArray(req.body.purpose_ids) ? req.body.purpose_ids : null);
    const body = {
      email,
      phone_number: phoneNumber,
      purpose_id: req.body.purposeId ?? req.body.purpose_id,
      purpose_ids: rawPurposeIds,
    };
    const result = await publicConsentService.withdrawConsent(req.tenant.id, appId, body, getClientIp(req));
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getConsentState(req, res, next) {
  try {
    const appId = req.appId || req.params.appId;
    const email = req.body.email ?? req.body.userEmail ?? req.body.user_email;
    const phoneNumber = req.body.phoneNumber ?? req.body.phone_number ?? req.body.phone;
    const result = await publicConsentService.getConsentStateByIdentity(
      req.tenant.id,
      appId,
      { email, phone_number: phoneNumber }
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPurposes,
  getPolicy,
  grantConsent,
  withdrawConsent,
  getConsentState,
};
