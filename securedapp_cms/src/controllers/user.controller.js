const getClientIp = require('../utils/getClientIp');
const userPortalService = require('../services/userPortal.service');

async function postSession(req, res, next) {
  try {
    const email = req.body.email;
    const phone = req.body.phone_number ?? req.body.phoneNumber ?? req.body.phone;
    const out = await userPortalService.createSession(email, phone);
    res.status(200).json(out);
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const { principal_id, email, phone_number: phoneNumber } = req.userPortal;
    res.status(200).json({
      principal_id,
      email,
      phone_number: phoneNumber,
    });
  } catch (err) {
    next(err);
  }
}

async function getConsents(req, res, next) {
  try {
    const { principal_id: principalId } = req.userPortal;
    const { tenant_id: tenantId, app_id: appId, status } = req.query;
    const items = await userPortalService.listConsents(principalId, {
      tenant_id: tenantId || undefined,
      app_id: appId || undefined,
      status: status || undefined,
    });
    res.status(200).json({ consents: items });
  } catch (err) {
    next(err);
  }
}

async function getSummary(req, res, next) {
  try {
    const summary = await userPortalService.getSummary(req.userPortal.principal_id);
    res.status(200).json(summary);
  } catch (err) {
    next(err);
  }
}

async function getTenants(req, res, next) {
  try {
    const tenants = await userPortalService.listTenantsForPrincipal(req.userPortal.principal_id);
    res.status(200).json({ tenants });
  } catch (err) {
    next(err);
  }
}

async function getApps(req, res, next) {
  try {
    const tenantId = req.query.tenant_id;
    const apps = await userPortalService.listAppsForPrincipal(req.userPortal.principal_id, tenantId);
    res.status(200).json({ apps });
  } catch (err) {
    next(err);
  }
}

async function getDsrRequests(req, res, next) {
  try {
    const { page, limit, status, tenant_id: tenantId, app_id: appId } = req.query;
    const out = await userPortalService.listDsrRequests(req.userPortal.principal_id, {
      page,
      limit,
      status,
      tenant_id: tenantId || undefined,
      app_id: appId || undefined,
    });
    res.status(200).json(out);
  } catch (err) {
    next(err);
  }
}

async function postDsrRequest(req, res, next) {
  try {
    const { principal_id: principalId, email, phone_number: phone } = req.userPortal;
    const result = await userPortalService.submitDsr(principalId, email, phone, req.body, getClientIp(req));
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  postSession,
  getMe,
  getConsents,
  getSummary,
  getTenants,
  getApps,
  getDsrRequests,
  postDsrRequest,
};
