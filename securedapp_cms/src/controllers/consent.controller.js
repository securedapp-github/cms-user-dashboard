const consentService = require('../services/consent.service');
const getClientIp = require('../utils/getClientIp');
const { pseudonymizeIdentityPair } = require('../utils/pseudonymizeUserIdentifier');

/**
 * GET /consent/:userId - Get current consent state from cache
 */
async function getState(req, res, next) {
  try {
    const appId = req.appId || req.params.appId;
    const items = await consentService.getConsentState(req.user.tenant_id, appId, req.params.userId);
    res.status(200).json({ userId: req.params.userId.trim(), consents: items });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /consent - Grant consent (app-scoped)
 */
async function grant(req, res, next) {
  try {
    const appId = req.appId || req.params.appId;
    const { userId, emailHash, phoneHash } = pseudonymizeIdentityPair(
      req.user.tenant_id,
      req.body.email,
      req.body.phone_number ?? req.body.phoneNumber
    );
    const rawPurposeIds = Array.isArray(req.body.purposeIds)
      ? req.body.purposeIds
      : (Array.isArray(req.body.purpose_ids) ? req.body.purpose_ids : null);
    const purposeIds = rawPurposeIds && rawPurposeIds.length > 0
      ? rawPurposeIds
      : [req.body.purposeId];

    const uniquePurposeIds = [...new Set(purposeIds.map((id) => String(id).trim()).filter(Boolean))];

    const consentIds = [];
    for (const purposeId of uniquePurposeIds) {
      const result = await consentService.grantConsent(
        req.user.tenant_id,
        appId,
        req.user.client_id,
        {
          userId,
          emailHash,
          phoneHash,
          purposeId,
          policyVersionId: req.body.policyVersionId,
        },
        getClientIp(req),
        {
          portalEmail: req.body.email,
          portalPhone: req.body.phone_number ?? req.body.phoneNumber,
        }
      );
      if (result.consentId) consentIds.push(result.consentId);
    }

    res.status(200).json({
      message: 'Consent recorded',
      consentId: consentIds.length === 1 ? consentIds[0] : null,
      consentIds,
      purposesProcessed: uniquePurposeIds.length,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /consent/:userId/:purposeId - Withdraw consent for (user, purpose). App-scoped.
 */
async function withdraw(req, res, next) {
  try {
    const appId = req.appId || req.params.appId;
    const { userId, emailHash } = pseudonymizeIdentityPair(
      req.user.tenant_id,
      req.body.email,
      req.body.phone_number ?? req.body.phoneNumber
    );
    const rawPurposeIds = Array.isArray(req.body.purposeIds)
      ? req.body.purposeIds
      : (Array.isArray(req.body.purpose_ids) ? req.body.purpose_ids : null);
    const purposeIds = rawPurposeIds && rawPurposeIds.length > 0
      ? rawPurposeIds
      : [req.body.purposeId ?? req.body.purpose_id ?? req.params.purposeId];
    const uniquePurposeIds = [...new Set(purposeIds.map((id) => String(id).trim()).filter(Boolean))];

    const results = [];
    for (const purposeId of uniquePurposeIds) {
      const result = await consentService.withdrawConsent(
        req.user.tenant_id,
        appId,
        userId,
        purposeId,
        req.user.client_id,
        getClientIp(req),
        { emailHash }
      );
      results.push({ purposeId, consentId: result.consentId, alreadyWithdrawn: Boolean(result.alreadyWithdrawn) });
    }

    const allAlreadyWithdrawn = results.length > 0 && results.every((r) => r.alreadyWithdrawn);
    const message = allAlreadyWithdrawn ? 'All consents already withdrawn' : 'Consent withdrawn';
    res.status(200).json({
      message,
      consentId: results.length === 1 ? results[0].consentId : null,
      consentIds: results.map((r) => r.consentId),
      purposesProcessed: uniquePurposeIds.length,
      results,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /consent/:userId/:purposeId - Withdraw consent for (user, purpose). Admin/App-scoped.
 * Used by admin dashboard where userId is already the hash.
 */
async function withdrawByAdmin(req, res, next) {
  try {
    const appId = req.appId || req.params.appId;
    const { userId, purposeId } = req.params;
    
    const result = await consentService.withdrawConsent(
      req.user.tenant_id,
      appId,
      userId,
      purposeId,
      req.user.client_id, // Admin's client/user ID
      getClientIp(req),
      { auditActionWithdrawn: 'ADMIN_CONSENT_WITHDRAWN' }
    );
    
    const message = result.alreadyWithdrawn ? 'Consent already withdrawn' : 'Consent withdrawn';
    res.status(200).json({ message, consentId: result.consentId });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /tenant/apps/:appId/consent/:userId/withdraw-many - Withdraw many purposes for one user (admin).
 */
async function withdrawManyByAdmin(req, res, next) {
  try {
    const appId = req.appId || req.params.appId;
    const userId = String(req.params.userId || '').trim();
    const rawPurposeIds = Array.isArray(req.body.purposeIds)
      ? req.body.purposeIds
      : (Array.isArray(req.body.purpose_ids) ? req.body.purpose_ids : []);
    const uniquePurposeIds = [...new Set(rawPurposeIds.map((id) => String(id).trim()).filter(Boolean))];

    const results = [];
    for (const purposeId of uniquePurposeIds) {
      const result = await consentService.withdrawConsent(
        req.user.tenant_id,
        appId,
        userId,
        purposeId,
        req.user.client_id,
        getClientIp(req),
        { auditActionWithdrawn: 'ADMIN_CONSENT_WITHDRAWN' }
      );
      results.push({ purposeId, consentId: result.consentId, alreadyWithdrawn: Boolean(result.alreadyWithdrawn) });
    }

    const allAlreadyWithdrawn = results.length > 0 && results.every((r) => r.alreadyWithdrawn);
    res.status(200).json({
      message: allAlreadyWithdrawn ? 'All consents already withdrawn' : 'Consent withdrawn',
      consentIds: results.map((r) => r.consentId),
      purposesProcessed: uniquePurposeIds.length,
      results,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /tenant/apps/:appId/consent/:userId/grant-many - Grant many purposes for one user (admin).
 */
async function grantManyByAdmin(req, res, next) {
  try {
    const appId = req.appId || req.params.appId;
    const userId = String(req.params.userId || '').trim();
    const policyVersionId = req.body.policyVersionId ?? req.body.policy_version_id;
    const rawPurposeIds = Array.isArray(req.body.purposeIds)
      ? req.body.purposeIds
      : (Array.isArray(req.body.purpose_ids) ? req.body.purpose_ids : []);
    const uniquePurposeIds = [...new Set(rawPurposeIds.map((id) => String(id).trim()).filter(Boolean))];

    const consentIds = [];
    for (const purposeId of uniquePurposeIds) {
      const result = await consentService.grantConsent(
        req.user.tenant_id,
        appId,
        req.user.client_id,
        {
          userId,
          purposeId,
          policyVersionId,
        },
        getClientIp(req),
        { auditActionGranted: 'ADMIN_CONSENT_GRANTED' }
      );
      if (result.consentId) consentIds.push(result.consentId);
    }

    res.status(200).json({
      message: 'Consent recorded',
      consentId: consentIds.length === 1 ? consentIds[0] : null,
      consentIds,
      purposesProcessed: uniquePurposeIds.length,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getState,
  grant,
  withdraw,
  withdrawByAdmin,
  withdrawManyByAdmin,
  grantManyByAdmin,
};
