const consentReadService = require('../services/consentRead.service');
const purposeService = require('../services/purpose.service');
const policyVersionService = require('../services/policyVersion.service');
const auditService = require('../services/audit.service');
const getClientIp = require('../utils/getClientIp');

/**
 * GET /consent/:userId — Derive current consent state from consent_events.
 * Authenticate via JWT, tenant_id from JWT, then derive and audit CONSENT_READ.
 */
async function getState(req, res, next) {
  try {
    const tenantId = req.user.tenant_id;
    const appId = req.appId || req.params.appId;
    const userId = req.params.userId.trim();

    const consents = await consentReadService.getConsentStateDerived(tenantId, appId, userId);

    await auditService.logAction({
      tenant_id: tenantId,
      actor_client_id: req.user.client_id,
      action: 'CONSENT_READ',
      resource_type: 'consent',
      resource_id: null,
      metadata: { user_id: userId },
      ip_address: getClientIp(req),
    });

    res.status(200).json({ consents });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /consent/:userId/export — Legacy export shape (deprecated, use /artifact).
 */
async function getExport(req, res, next) {
  try {
    const tenantId = req.user.tenant_id;
    const appId = req.appId || req.params.appId;
    const userId = req.params.userId.trim();

    const exportData = await consentReadService.getConsentStateExport(tenantId, appId, userId);

    await auditService.logAction({
      tenant_id: tenantId,
      actor_client_id: req.user.client_id,
      action: 'CONSENT_READ',
      resource_type: 'consent',
      resource_id: null,
      metadata: { user_id: userId, export: true },
      ip_address: getClientIp(req),
    });

    res.status(200).json(exportData);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /consent/:userId/artifact — Consent artifact: consentId, dataPrincipal, dataFiduciary, purpose (id, text), data_ids, audit, signature, status.
 */
async function getArtifact(req, res, next) {
  try {
    const tenantId = req.user.tenant_id;
    const appId = req.appId || req.params.appId;
    const userId = req.params.userId.trim();
    const ipAddress = getClientIp(req);

    const result = await consentReadService.getConsentArtifact(tenantId, appId, userId, ipAddress);

    await auditService.logAction({
      tenant_id: tenantId,
      actor_client_id: req.user.client_id,
      action: 'CONSENT_READ',
      resource_type: 'consent',
      resource_id: null,
      metadata: { user_id: userId, artifact: true },
      ip_address: ipAddress,
    });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getState,
  getExport,
  getArtifact,
  async getAppLookups(req, res, next) {
    try {
      const tenantId = req.user.tenant_id;
      const actorClientId = req.user.client_id;
      const appId = req.appId || req.params.appId;
      const ipAddress = getClientIp(req);

      const [purposes, policyVersions] = await Promise.all([
        purposeService.listPurposes(tenantId, actorClientId, ipAddress),
        policyVersionService.listPolicyVersions(tenantId, appId, actorClientId, ipAddress),
      ]);

      // Keep both camelCase and snake_case keys for frontend compatibility.
      res.status(200).json({
        purposes,
        policyVersions,
        policy_versions: policyVersions,
      });
    } catch (err) {
      next(err);
    }
  },
  async listAppConsents(req, res, next) {
    try {
      const tenantId = req.user.tenant_id;
      const appId = req.appId || req.params.appId;
      const consents = await consentReadService.listAppConsents(tenantId, appId);
      const byUser = {};
      for (const c of consents) {
        if (!byUser[c.userId]) {
          byUser[c.userId] = { userId: c.userId, purposes: [] };
        }
        byUser[c.userId].purposes.push({
          purposeId: c.purposeId,
          purposeName: c.purposeName,
          currentStatus: c.currentStatus,
          policyVersionId: c.policyVersionId,
          policyVersion: c.policyVersion,
          updatedAt: c.updatedAt,
        });
      }
      res.status(200).json({
        consents,
        consentsByUser: Object.values(byUser),
      });
    } catch (err) {
      next(err);
    }
  },
};
