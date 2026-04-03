const { Consent, DsrRequest, Client, Webhook, Sequelize } = require('../models');
const { Op } = Sequelize;

/**
 * GET /tenant/stats
 * Tenant-wide dashboard statistics
 */
async function getStats(req, res, next) {
  try {
    const tenantId = req.user.tenant_id;
    
    const [active_consents, open_dsr_requests, registered_clients, active_webhooks] = await Promise.all([
      Consent.count({ where: { tenant_id: tenantId, status: 'ACTIVE' } }),
      DsrRequest.count({ where: { tenant_id: tenantId, status: { [Op.ne]: 'completed' } } }),
      Client.count({ where: { tenant_id: tenantId } }),
      Webhook.count({ where: { tenant_id: tenantId, active: true } })
    ]);

    res.status(200).json({
      active_consents,
      open_dsr_requests,
      registered_clients,
      active_webhooks
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStats,
};
