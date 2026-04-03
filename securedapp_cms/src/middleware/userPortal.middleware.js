const userPortalService = require('../services/userPortal.service');

/**
 * Bearer JWT issued by POST /user/auth/session (typ: user_portal).
 */
function requireUserPortal(req, res, next) {
  const header = req.headers.authorization || '';
  const m = /^Bearer\s+(.+)$/i.exec(header);
  if (!m) {
    return res.status(401).json({ error: 'Authorization Bearer token required' });
  }
  try {
    req.userPortal = userPortalService.verifyPortalToken(m[1].trim());
    return next();
  } catch (err) {
    const status = err.statusCode || 401;
    return res.status(status).json({ error: err.message || 'Unauthorized' });
  }
}

module.exports = {
  requireUserPortal,
};
