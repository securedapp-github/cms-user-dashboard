const { body, query, validationResult } = require('express-validator');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CONSENT_STATUS_FILTER = ['active', 'expiring_soon', 'revoked', 'expired', 'all'];
const DSR_TYPES = ['access', 'erasure', 'rectification'];
const DSR_STATUSES = ['pending', 'processing', 'completed', 'rejected'];

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  return next();
}

const portalSessionValidation = [
  body('email').trim().isEmail().withMessage('email must be a valid email'),
  body('phone_number').optional().trim(),
  body('phoneNumber').optional().trim(),
  body('phone').optional().trim(),
  body().custom((value) => {
    const phone = value.phone_number ?? value.phoneNumber ?? value.phone;
    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      throw new Error('phone_number is required');
    }
    return true;
  }),
];

const consentsQueryValidation = [
  query('tenant_id').optional().trim().matches(UUID_REGEX).withMessage('tenant_id must be a valid UUID'),
  query('app_id').optional().trim().matches(UUID_REGEX).withMessage('app_id must be a valid UUID'),
  query('status')
    .optional()
    .trim()
    .isIn(CONSENT_STATUS_FILTER)
    .withMessage(`status must be one of: ${CONSENT_STATUS_FILTER.join(', ')}`),
];

const appsQueryValidation = [
  query('tenant_id').trim().matches(UUID_REGEX).withMessage('tenant_id must be a valid UUID'),
];

const dsrListQueryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1–100'),
  query('status').optional().trim().isIn(DSR_STATUSES).withMessage('invalid status'),
  query('tenant_id').optional().trim().matches(UUID_REGEX).withMessage('tenant_id must be a valid UUID'),
  query('app_id').optional().trim().matches(UUID_REGEX).withMessage('app_id must be a valid UUID'),
];

const dsrSubmitValidation = [
  body('tenant_id').trim().matches(UUID_REGEX).withMessage('tenant_id must be a valid UUID'),
  body('app_id').trim().matches(UUID_REGEX).withMessage('app_id must be a valid UUID'),
  body('request_type')
    .optional()
    .trim()
    .isIn(DSR_TYPES)
    .withMessage(`request_type must be one of: ${DSR_TYPES.join(', ')}`),
  body('type')
    .optional()
    .trim()
    .isIn(DSR_TYPES)
    .withMessage(`type must be one of: ${DSR_TYPES.join(', ')}`),
  body('description').trim().isLength({ min: 1, max: 10000 }).withMessage('description is required (max 10000 chars)'),
  body('attachments').optional().isObject().withMessage('attachments must be an object'),
  body().custom((value) => {
    const rt = value.request_type ?? value.type;
    if (!rt) throw new Error('request_type (or type) is required');
    return true;
  }),
];

module.exports = {
  handleValidationErrors,
  portalSessionValidation,
  consentsQueryValidation,
  appsQueryValidation,
  dsrListQueryValidation,
  dsrSubmitValidation,
};
