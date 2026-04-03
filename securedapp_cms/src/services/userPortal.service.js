const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { Consent, DsrRequest, Tenant, App, Purpose } = require('../models');
const { pseudonymizeIdentityPair, normalizeEmail, normalizePhone } = require('../utils/pseudonymizeUserIdentifier');
const principalService = require('./principal.service');
const dsrService = require('./dsr.service');

const USER_PORTAL_JWT_SECRET = process.env.USER_PORTAL_JWT_SECRET || process.env.JWT_SECRET;
const USER_PORTAL_JWT_EXPIRES_IN = process.env.USER_PORTAL_JWT_EXPIRES_IN || '7d';
const EXPIRING_SOON_DAYS = parseInt(process.env.USER_PORTAL_EXPIRING_SOON_DAYS || '7', 10) || 7;

function assertPortalJwtConfigured() {
  if (!USER_PORTAL_JWT_SECRET) {
    const err = new Error('USER_PORTAL_JWT_SECRET or JWT_SECRET must be set');
    err.statusCode = 500;
    throw err;
  }
}

function signPortalToken(principalId, email, phoneNumber) {
  assertPortalJwtConfigured();
  return jwt.sign(
    {
      typ: 'user_portal',
      sub: principalId,
      email,
      phone_number: phoneNumber,
    },
    USER_PORTAL_JWT_SECRET,
    { expiresIn: USER_PORTAL_JWT_EXPIRES_IN }
  );
}

function verifyPortalToken(token) {
  assertPortalJwtConfigured();
  const payload = jwt.verify(token, USER_PORTAL_JWT_SECRET);
  if (payload.typ !== 'user_portal' || !payload.sub) {
    const err = new Error('Invalid user portal token');
    err.statusCode = 401;
    throw err;
  }
  return {
    principal_id: payload.sub,
    email: payload.email,
    phone_number: payload.phone_number,
  };
}

async function createSession(email, phone) {
  const normEmail = normalizeEmail(email);
  const normPhone = normalizePhone(phone);
  const principal = await principalService.getOrCreatePrincipal(normEmail, normPhone);
  const token = signPortalToken(principal.id, normEmail, normPhone);
  return {
    token,
    token_type: 'Bearer',
    expires_in: USER_PORTAL_JWT_EXPIRES_IN,
    principal_id: principal.id,
  };
}

function mapUiConsentStatus(consentRow) {
  const now = new Date();
  const soon = new Date(now.getTime() + EXPIRING_SOON_DAYS * 24 * 60 * 60 * 1000);
  if (consentRow.status === 'WITHDRAWN') return 'revoked';
  if (consentRow.status === 'EXPIRED') return 'expired';
  if (consentRow.status === 'ACTIVE' && consentRow.expires_at) {
    const exp = new Date(consentRow.expires_at);
    if (exp < now) return 'expired';
    if (exp <= soon) return 'expiring_soon';
  }
  return 'active';
}

function buildConsentWhere(principalId, filters = {}) {
  const where = { principal_id: principalId };
  if (filters.tenant_id) where.tenant_id = filters.tenant_id;
  if (filters.app_id) where.app_id = filters.app_id;

  const now = new Date();
  const soon = new Date(now.getTime() + EXPIRING_SOON_DAYS * 24 * 60 * 60 * 1000);
  const status = filters.status;
  if (!status || status === 'all') {
    return where;
  }

  if (status === 'revoked') {
    where.status = 'WITHDRAWN';
  } else if (status === 'expired') {
    where[Op.or] = [
      { status: 'EXPIRED' },
      { status: 'ACTIVE', expires_at: { [Op.ne]: null, [Op.lt]: now } },
    ];
  } else if (status === 'expiring_soon') {
    where.status = 'ACTIVE';
    where.expires_at = { [Op.ne]: null, [Op.gte]: now, [Op.lte]: soon };
  } else if (status === 'active') {
    where.status = 'ACTIVE';
    where[Op.or] = [{ expires_at: null }, { expires_at: { [Op.gt]: soon } }];
  }

  return where;
}

async function listConsents(principalId, filters = {}) {
  const where = buildConsentWhere(principalId, filters);
  const rows = await Consent.findAll({
    where,
    include: [
      { model: Tenant, attributes: ['id', 'name'] },
      { model: App, attributes: ['id', 'name', 'slug', 'status'] },
      { model: Purpose, attributes: ['id', 'name', 'description'] },
    ],
    order: [['granted_at', 'DESC']],
  });

  return rows.map((c) => {
    const j = c.toJSON();
    return {
      id: j.id,
      tenant: j.Tenant ? { id: j.Tenant.id, name: j.Tenant.name } : null,
      app: j.App ? { id: j.App.id, name: j.App.name, slug: j.App.slug } : null,
      purpose: j.Purpose
        ? { id: j.Purpose.id, name: j.Purpose.name, description: j.Purpose.description }
        : null,
      status: mapUiConsentStatus(j),
      consent_status: j.status,
      granted_at: j.granted_at,
      expires_at: j.expires_at,
    };
  });
}

async function getSummary(principalId) {
  const base = { principal_id: principalId };
  const now = new Date();
  const soon = new Date(now.getTime() + EXPIRING_SOON_DAYS * 24 * 60 * 60 * 1000);

  const [
    total_consents,
    active,
    expiring_soon,
    revoked,
    expired,
    pending_dsr,
    institutionsRows,
  ] = await Promise.all([
    Consent.count({ where: base }),
    Consent.count({
      where: {
        ...base,
        status: 'ACTIVE',
        [Op.or]: [{ expires_at: null }, { expires_at: { [Op.gt]: soon } }],
      },
    }),
    Consent.count({
      where: {
        ...base,
        status: 'ACTIVE',
        expires_at: { [Op.ne]: null, [Op.gte]: now, [Op.lte]: soon },
      },
    }),
    Consent.count({ where: { ...base, status: 'WITHDRAWN' } }),
    Consent.count({
      where: {
        principal_id: principalId,
        [Op.or]: [
          { status: 'EXPIRED' },
          { status: 'ACTIVE', expires_at: { [Op.ne]: null, [Op.lt]: now } },
        ],
      },
    }),
    DsrRequest.count({
      where: { principal_id: principalId, status: { [Op.in]: ['pending', 'processing'] } },
    }),
    Consent.findAll({
      where: base,
      attributes: ['tenant_id'],
      group: ['tenant_id'],
      raw: true,
    }),
  ]);

  const institutions_count = institutionsRows.filter((r) => r.tenant_id).length;

  return {
    total_consents,
    active_consents: active,
    expiring_soon,
    revoked,
    expired,
    pending_dsr,
    institutions_count,
  };
}

async function listTenantsForPrincipal(principalId) {
  const distinct = await Consent.findAll({
    where: { principal_id: principalId },
    attributes: ['tenant_id'],
    group: ['tenant_id'],
    raw: true,
  });
  const ids = [...new Set(distinct.map((r) => r.tenant_id).filter(Boolean))];
  if (ids.length === 0) return [];
  const tenants = await Tenant.findAll({
    where: { id: ids },
    attributes: ['id', 'name', 'status'],
    order: [['name', 'ASC']],
  });
  return tenants.map((t) => ({ id: t.id, name: t.name, status: t.status }));
}

async function listAppsForPrincipal(principalId, tenantId) {
  if (!tenantId) {
    const err = new Error('tenant_id is required');
    err.statusCode = 400;
    throw err;
  }
  const distinct = await Consent.findAll({
    where: { principal_id: principalId, tenant_id: tenantId },
    attributes: ['app_id'],
    group: ['app_id'],
    raw: true,
  });
  const ids = [...new Set(distinct.map((r) => r.app_id).filter(Boolean))];
  if (ids.length === 0) return [];
  const apps = await App.findAll({
    where: { id: ids, tenant_id: tenantId },
    attributes: ['id', 'name', 'slug', 'status'],
    order: [['name', 'ASC']],
  });
  return apps.map((a) => ({ id: a.id, name: a.name, slug: a.slug, status: a.status }));
}

async function listDsrRequests(principalId, options = {}) {
  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 20));
  const where = { principal_id: principalId };
  if (options.status && dsrService.STATUSES.includes(options.status)) where.status = options.status;
  if (options.tenant_id) where.tenant_id = options.tenant_id;
  if (options.app_id) where.app_id = options.app_id;

  const { rows, count } = await DsrRequest.findAndCountAll({
    where,
    include: [
      { model: Tenant, attributes: ['id', 'name'] },
      { model: App, attributes: ['id', 'name', 'slug'] },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset: (page - 1) * limit,
  });

  return {
    requests: rows.map((r) => {
      const j = r.toJSON();
      return {
        id: j.id,
        tenant: j.Tenant ? { id: j.Tenant.id, name: j.Tenant.name } : null,
        app: j.App ? { id: j.App.id, name: j.App.name, slug: j.App.slug } : null,
        request_type: j.request_type,
        status: j.status,
        description: j.description,
        created_at: j.created_at,
      };
    }),
    pagination: {
      page,
      limit,
      total: count,
      total_pages: Math.ceil(count / limit) || 1,
    },
  };
}

async function submitDsr(principalId, email, phone, body, ipAddress = null) {
  const requestType = body.request_type ?? body.type;
  const { tenant_id: tenantId, app_id: appId, description, attachments } = body;
  if (!tenantId || !appId) {
    const err = new Error('tenant_id and app_id are required');
    err.statusCode = 400;
    throw err;
  }
  if (!description || !String(description).trim()) {
    const err = new Error('description is required');
    err.statusCode = 400;
    throw err;
  }

  const app = await App.findOne({ where: { id: appId, tenant_id: tenantId }, attributes: ['id'] });
  if (!app) {
    const err = new Error('App not found for this organisation');
    err.statusCode = 404;
    throw err;
  }

  const { userId } = pseudonymizeIdentityPair(tenantId, email, phone);

  return dsrService.submitRequest(tenantId, appId, {
    user_id: userId,
    type: requestType,
    request_type: requestType,
    description: String(description).trim(),
    attachments: attachments != null ? attachments : null,
    principal_id: principalId,
  }, ipAddress);
}

module.exports = {
  createSession,
  verifyPortalToken,
  listConsents,
  getSummary,
  listTenantsForPrincipal,
  listAppsForPrincipal,
  listDsrRequests,
  submitDsr,
  mapUiConsentStatus,
};
