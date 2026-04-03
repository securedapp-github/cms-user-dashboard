/**
 * Webhook dispatcher: enqueue delivery jobs. Does not send HTTP; worker does.
 * API stays fast; Redis/BullMQ + worker handle delivery with retries.
 */
const { Webhook } = require('../models');
const webhookQueue = require('../queues/webhook.queue');
const { WebhookDelivery } = require('../models');
const axios = require('axios');
const { signPayload } = require('../utils/webhookSigner');
const logger = require('../config/logger');
const crypto = require('crypto');

function normalizeWebhookEvents(rawEvents) {
  if (Array.isArray(rawEvents)) {
    return rawEvents.map((e) => (typeof e === 'string' ? e.trim() : '')).filter(Boolean);
  }
  if (typeof rawEvents === 'string') {
    const trimmed = rawEvents.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((e) => (typeof e === 'string' ? e.trim() : '')).filter(Boolean);
      }
    } catch (_) {
      // fall through: allow comma-separated legacy values
    }
    return trimmed.split(',').map((e) => e.trim()).filter(Boolean);
  }
  return [];
}

function buildEventId() {
  return `evt_${crypto.randomBytes(3).toString('hex')}`;
}

function maskIpAddress(ipAddress) {
  const ip = String(ipAddress || '').trim();
  if (!ip) return 'masked_or_partial';
  if (ip.includes(':')) {
    const parts = ip.split(':').filter(Boolean);
    if (parts.length <= 2) return 'masked_or_partial';
    return `${parts.slice(0, 2).join(':')}:****`;
  }
  const parts = ip.split('.');
  if (parts.length !== 4) return 'masked_or_partial';
  return `${parts[0]}.${parts[1]}.x.x`;
}

/**
 * Build final payload shape aligned to consent.updated contract.
 * @param {string} tenant_id
 * @param {Object} payload - consent/user/context/metadata details
 */
function buildPayload(tenant_id, payload) {
  const nowIso = new Date().toISOString();
  const p = payload && typeof payload === 'object' ? payload : {};
  const purposeId = p.purpose_id || p.purposeId || null;
  const purposeName = p.purpose_name || p.purposeName || 'unknown';
  const consentStatus = String(p.status || '').toLowerCase() === 'withdrawn' ? 'denied' : 'granted';
  const purposeStatus = consentStatus;
  const verificationMethod = p.verification_method || 'otp';
  const verificationChannel = p.verification_channel || 'sms';
  const source = p.source || 'embedded_flow';

  return {
    event: 'consent.updated',
    event_id: buildEventId(),
    timestamp: nowIso,
    tenant_id,
    app_id: p.app_id || p.appId || null,
    consent: {
      consent_id: p.consent_id || p.consentId || null,
      status: consentStatus,
      policy_version_id: p.policy_version_id || p.policyVersionId || null,
      purposes: purposeId
        ? [{ purpose_id: purposeId, name: purposeName, status: purposeStatus }]
        : [],
    },
    user: {
      user_id: p.user_id || p.userId || null,
      mobile: p.phone_hash || p.mobile || 'masked_or_hashed',
      email: p.email_hash || p.email || 'masked_or_hashed',
    },
    verification: {
      method: verificationMethod,
      channel: verificationChannel,
      verified: true,
      verified_at: p.verified_at || nowIso,
    },
    context: {
      channel: p.channel || 'web',
      ip_address: maskIpAddress(p.ip_address || p.ipAddress),
      user_agent: p.user_agent || 'device_info',
      geo: p.geo || 'IN',
    },
    metadata: {
      source,
      version: 'v1',
    },
  };
}

/**
 * Dispatch event to all matching webhooks by enqueueing one job per webhook.
 * Runs off the request (setImmediate) so API never waits for queue/Redis.
 * @param {Object} params
 * @param {string} params.event - consent.updated | policy.updated | purpose.created
 * @param {string} params.tenant_id - Tenant UUID
 * @param {Object} params.payload - Event data (user_id, purpose_id, policy_version_id, etc.)
 */
function dispatch({ event, tenant_id, payload }) {
  if (!tenant_id) return;

  setImmediate(async () => {
    try {
      const webhooks = await Webhook.findAll({
        where: { tenant_id, active: true },
        attributes: ['id', 'url', 'secret', 'events'],
      });

      const legacyEvents = Array.isArray(payload?.legacy_events) ? payload.legacy_events : [];
      const effectiveEvent = event || 'consent.updated';
      const subscribed = webhooks.filter((wh) => {
      const events = normalizeWebhookEvents(wh.events);
        return events.includes(effectiveEvent) || legacyEvents.some((e) => events.includes(e)) || events.includes('*');
      });

      const body = buildPayload(tenant_id, payload);
      const useQueue = Boolean(webhookQueue) && process.env.WEBHOOK_USE_QUEUE === 'true';

      logger.info('Webhook dispatch started', {
        event: body.event,
        tenant_id,
        subscribed_count: subscribed.length,
        mode: useQueue ? 'queue' : 'direct',
      });

      if (subscribed.length === 0) {
        logger.info('Webhook dispatch skipped: no subscribers', { event: body.event, tenant_id });
        return;
      }

      // Queue mode is opt-in. By default we deliver directly so webhooks still work
      // when Redis/worker are not running in hosted environments.
      if (useQueue) {
        for (const wh of subscribed) {
          const url = wh.url && typeof wh.url === 'string' ? wh.url.trim() : '';
          if (!url) continue;

          await webhookQueue.add(
            'deliverWebhook',
            {
              webhook_id: wh.id,
              url,
              secret: wh.secret || '',
              body,
            },
            {
              attempts: 5,
              backoff: { type: 'exponential', delay: 60000 },
            }
          );
          logger.info('Webhook queued', {
            event: body.event,
            tenant_id,
            webhook_id: wh.id,
            url,
          });
        }
        return;
      }

      // Direct delivery mode (default): send synchronously via HTTP.
      const timestampSeconds = Math.floor(Date.now() / 1000);
      const payloadStr = JSON.stringify(body);
      for (const wh of subscribed) {
        const url = wh.url && typeof wh.url === 'string' ? wh.url.trim() : '';
        if (!url) continue;

        const secret = wh.secret || '';
        const { signatureHeader } = signPayload(secret, payloadStr, timestampSeconds);

        const response = await axios.post(url, body, {
          headers: {
            'Content-Type': 'application/json',
            'x-webhook-signature': signatureHeader,
            'x-webhook-timestamp': String(timestampSeconds),
            'x-webhook-event': body.event,
          },
          timeout: 15000,
          validateStatus: () => true,
        });

        const success = response.status >= 200 && response.status < 300;
        await WebhookDelivery.create({
          webhook_id: wh.id,
          payload: body,
          status: success ? 'success' : 'failed',
          response_code: response.status,
          retries: 0,
        });
        logger.info('Webhook delivered', {
          event: body.event,
          tenant_id,
          webhook_id: wh.id,
          url,
          status: success ? 'success' : 'failed',
          response_code: response.status,
        });
      }
    } catch (err) {
      if (process.env.NODE_ENV !== 'test') {
        logger.warn('Webhook dispatch error', {
          event,
          tenant_id,
          error: err.message,
        });
      }
    }
  });
}

module.exports = {
  dispatch,
  buildPayload,
};
