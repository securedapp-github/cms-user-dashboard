const { body, param } = require('express-validator');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const grantConsentValidation = [
  body('email').trim().notEmpty().withMessage('email is required').isString().withMessage('email must be a string'),
  body('phone_number')
    .optional()
    .trim()
    .isString()
    .withMessage('phone_number must be a string'),
  body('phoneNumber')
    .optional()
    .trim()
    .isString()
    .withMessage('phoneNumber must be a string'),
  body('purposeId')
    .optional()
    .trim()
    .matches(UUID_REGEX)
    .withMessage('purposeId must be a valid UUID'),
  body('purposeIds')
    .optional()
    .isArray({ min: 1 })
    .withMessage('purposeIds must be a non-empty array'),
  body('purposeIds.*')
    .optional()
    .trim()
    .matches(UUID_REGEX)
    .withMessage('purposeIds must contain valid UUIDs'),
  body('purpose_ids')
    .optional()
    .isArray({ min: 1 })
    .withMessage('purpose_ids must be a non-empty array'),
  body('purpose_ids.*')
    .optional()
    .trim()
    .matches(UUID_REGEX)
    .withMessage('purpose_ids must contain valid UUIDs'),
  body('policyVersionId')
    .trim()
    .notEmpty()
    .withMessage('policyVersionId is required')
    .matches(UUID_REGEX)
    .withMessage('policyVersionId must be a valid UUID'),
  body().custom((value) => {
    const phone = value.phone_number ?? value.phoneNumber;
    const singlePurposeId = value.purposeId;
    const purposeIdsArray = value.purposeIds ?? value.purpose_ids;
    if (!phone || typeof phone !== 'string' || !phone.trim()) throw new Error('phone_number is required');
    if (singlePurposeId == null && !Array.isArray(purposeIdsArray)) {
      throw new Error('purposeId or purposeIds is required');
    }
    if (Array.isArray(purposeIdsArray) && purposeIdsArray.length === 0) {
      throw new Error('purposeIds must be a non-empty array');
    }
    return true;
  }),
];

const withdrawConsentBodyValidation = [
  body('email').trim().notEmpty().withMessage('email is required').isString().withMessage('email must be a string'),
  body('phone_number')
    .optional()
    .trim()
    .isString()
    .withMessage('phone_number must be a string'),
  body('phoneNumber')
    .optional()
    .trim()
    .isString()
    .withMessage('phoneNumber must be a string'),
  body('purposeId')
    .optional()
    .trim()
    .matches(UUID_REGEX)
    .withMessage('purposeId must be a valid UUID'),
  body('purposeIds')
    .optional()
    .isArray({ min: 1 })
    .withMessage('purposeIds must be a non-empty array'),
  body('purposeIds.*')
    .optional()
    .trim()
    .matches(UUID_REGEX)
    .withMessage('purposeIds must contain valid UUIDs'),
  body('purpose_id')
    .optional()
    .trim()
    .matches(UUID_REGEX)
    .withMessage('purpose_id must be a valid UUID'),
  body('purpose_ids')
    .optional()
    .isArray({ min: 1 })
    .withMessage('purpose_ids must be a non-empty array'),
  body('purpose_ids.*')
    .optional()
    .trim()
    .matches(UUID_REGEX)
    .withMessage('purpose_ids must contain valid UUIDs'),
  body().custom((value) => {
    const phone = value.phone_number ?? value.phoneNumber;
    const purposeId = value.purposeId ?? value.purpose_id;
    const purposeIds = value.purposeIds ?? value.purpose_ids;
    if (!phone || typeof phone !== 'string' || !phone.trim()) throw new Error('phone_number is required');
    if (purposeId == null && !Array.isArray(purposeIds)) throw new Error('purposeId or purposeIds is required');
    if (Array.isArray(purposeIds) && purposeIds.length === 0) throw new Error('purposeIds must be a non-empty array');
    if (purposeId != null && (!String(purposeId).trim() || !UUID_REGEX.test(String(purposeId).trim()))) {
      throw new Error('purposeId must be a valid UUID');
    }
    return true;
  }),
];

const withdrawConsentParamValidation = [
  param('purposeId')
    .trim()
    .notEmpty()
    .withMessage('purposeId is required')
    .matches(UUID_REGEX)
    .withMessage('purposeId must be a valid UUID'),
];

const adminWithdrawManyValidation = [
  param('userId')
    .trim()
    .notEmpty()
    .withMessage('userId is required'),
  body('purposeIds')
    .optional()
    .isArray({ min: 1 })
    .withMessage('purposeIds must be a non-empty array'),
  body('purposeIds.*')
    .optional()
    .trim()
    .matches(UUID_REGEX)
    .withMessage('purposeIds must contain valid UUIDs'),
  body('purpose_ids')
    .optional()
    .isArray({ min: 1 })
    .withMessage('purpose_ids must be a non-empty array'),
  body('purpose_ids.*')
    .optional()
    .trim()
    .matches(UUID_REGEX)
    .withMessage('purpose_ids must contain valid UUIDs'),
  body().custom((value) => {
    const purposeIds = value.purposeIds ?? value.purpose_ids;
    if (!Array.isArray(purposeIds) || purposeIds.length === 0) {
      throw new Error('purposeIds is required');
    }
    return true;
  }),
];

const adminGrantManyValidation = [
  param('userId')
    .trim()
    .notEmpty()
    .withMessage('userId is required'),
  body('policyVersionId')
    .optional()
    .trim()
    .matches(UUID_REGEX)
    .withMessage('policyVersionId must be a valid UUID'),
  body('policy_version_id')
    .optional()
    .trim()
    .matches(UUID_REGEX)
    .withMessage('policy_version_id must be a valid UUID'),
  body('purposeIds')
    .optional()
    .isArray({ min: 1 })
    .withMessage('purposeIds must be a non-empty array'),
  body('purposeIds.*')
    .optional()
    .trim()
    .matches(UUID_REGEX)
    .withMessage('purposeIds must contain valid UUIDs'),
  body('purpose_ids')
    .optional()
    .isArray({ min: 1 })
    .withMessage('purpose_ids must be a non-empty array'),
  body('purpose_ids.*')
    .optional()
    .trim()
    .matches(UUID_REGEX)
    .withMessage('purpose_ids must contain valid UUIDs'),
  body().custom((value) => {
    const policyVersionId = value.policyVersionId ?? value.policy_version_id;
    const purposeIds = value.purposeIds ?? value.purpose_ids;
    if (!policyVersionId || !String(policyVersionId).trim()) {
      throw new Error('policyVersionId is required');
    }
    if (!UUID_REGEX.test(String(policyVersionId).trim())) {
      throw new Error('policyVersionId must be a valid UUID');
    }
    if (!Array.isArray(purposeIds) || purposeIds.length === 0) {
      throw new Error('purposeIds is required');
    }
    return true;
  }),
];

const getConsentParamValidation = [
  param('userId')
    .trim()
    .notEmpty()
    .withMessage('userId is required'),
];

function handleValidationErrors(req, res, next) {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error(errors.array().map((e) => e.msg).join('; '));
    err.statusCode = 400;
    err.validationErrors = errors.array();
    return next(err);
  }
  next();
}

module.exports = {
  grantConsentValidation,
  withdrawConsentBodyValidation,
  withdrawConsentParamValidation,
  adminWithdrawManyValidation,
  adminGrantManyValidation,
  getConsentParamValidation,
  handleValidationErrors,
};
