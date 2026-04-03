const express = require('express');
const { body } = require('express-validator');
const tenantController = require('../controllers/tenant.controller');
const apiKeyController = require('../controllers/apiKey.controller');
const appController = require('../controllers/app.controller');
const consentReadController = require('../controllers/consentRead.controller');
const consentController = require('../controllers/consent.controller');
const policyVersionRoutes = require('./policyVersion.routes');
const { adminRouter: dsrAdminRoutes } = require('./dsr.routes');
const { authenticate, requireTenant, requireRole, handleValidationErrors } = require('../middleware/auth.middleware');
const { requireApp } = require('../middleware/app.middleware');
const { createValidation, revokeParamValidation } = require('../validators/apiKey.validator');
const {
  createAppValidation,
  updateAppValidation,
  appIdParamValidation,
  handleValidationErrors: handleAppValidationErrors,
} = require('../validators/app.validator');
const {
  withdrawConsentParamValidation,
  adminWithdrawManyValidation,
  adminGrantManyValidation,
  handleValidationErrors: handleConsentValidationErrors,
} = require('../validators/consent.validator');

const router = express.Router();

const onboardValidation = [
  body('organization_name').trim().notEmpty().withMessage('organization_name is required'),
  body('country').trim().notEmpty().withMessage('country is required'),
  body('industry').optional().trim().isString(),
  body('consent_flow').optional().isIn(['embedded', 'redirect']).withMessage('consent_flow must be embedded or redirect'),
  body('cin').optional({ nullable: true }).trim().isString().withMessage('cin must be a string'),
  body('gst').optional({ nullable: true }).trim().isString().withMessage('gst must be a string'),
  body('address').optional({ nullable: true }).isObject().withMessage('address must be an object'),
];

const updateMeValidation = [
  body('organization_name').optional().trim().notEmpty().withMessage('organization_name cannot be empty'),
  body('country').optional().trim().notEmpty().withMessage('country cannot be empty'),
  body('industry').optional({ nullable: true }).custom((v) => v == null || typeof v === 'string').withMessage('industry must be a string'),
  body('consent_flow').optional().isIn(['embedded', 'redirect']).withMessage('consent_flow must be embedded or redirect'),
  body('cin').optional({ nullable: true }).trim().isString().withMessage('cin must be a string'),
  body('gst').optional({ nullable: true }).trim().isString().withMessage('gst must be a string'),
  body('address').optional({ nullable: true }).isObject().withMessage('address must be an object'),
];

router.post('/onboard', authenticate, onboardValidation, handleValidationErrors, tenantController.onboard);
router.get('/me', authenticate, requireTenant, tenantController.getMe);
router.put('/me', authenticate, requireTenant, updateMeValidation, handleValidationErrors, tenantController.updateMe);
router.get('/stats', authenticate, requireTenant, tenantController.getStats);

// API keys (owner/admin)
router.post('/api-keys', authenticate, requireTenant, requireRole('owner', 'admin'), createValidation, handleValidationErrors, apiKeyController.create);
router.get('/api-keys', authenticate, requireTenant, requireRole('owner', 'admin'), apiKeyController.list);
router.delete('/api-keys/:id', authenticate, requireTenant, requireRole('owner', 'admin'), revokeParamValidation, handleValidationErrors, apiKeyController.revoke);

// Apps (owner/admin for create/update/delete)
router.get('/apps', authenticate, requireTenant, appController.list);
router.post('/apps', authenticate, requireTenant, requireRole('owner', 'admin'), createAppValidation, handleAppValidationErrors, appController.create);
router.get('/apps/:appId', authenticate, requireTenant, appIdParamValidation, handleAppValidationErrors, appController.getById);
router.put('/apps/:appId', authenticate, requireTenant, requireRole('owner', 'admin'), appIdParamValidation, updateAppValidation, handleAppValidationErrors, appController.update);
router.delete('/apps/:appId', authenticate, requireTenant, requireRole('owner', 'admin'), appIdParamValidation, handleAppValidationErrors, appController.remove);

// App-scoped: policy versions and DSR (admin routes only; public DSR submit stays at POST /dsr/request with app_id in body)
const appScopedRouter = express.Router({ mergeParams: true });
appScopedRouter.use(authenticate, requireTenant, requireApp);
appScopedRouter.get('/lookups', requireRole('owner', 'admin', 'compliance_manager', 'auditor'), consentReadController.getAppLookups);
appScopedRouter.get('/consents', requireRole('owner', 'admin', 'compliance_manager', 'auditor'), consentReadController.listAppConsents);
appScopedRouter.delete('/consent/:userId/:purposeId', requireRole('owner', 'admin'), withdrawConsentParamValidation, handleConsentValidationErrors, consentController.withdrawByAdmin);
appScopedRouter.post('/consent/:userId/grant-many', requireRole('owner', 'admin'), adminGrantManyValidation, handleConsentValidationErrors, consentController.grantManyByAdmin);
appScopedRouter.post('/consent/:userId/withdraw-many', requireRole('owner', 'admin'), adminWithdrawManyValidation, handleConsentValidationErrors, consentController.withdrawManyByAdmin);
appScopedRouter.use('/policy-versions', policyVersionRoutes);
appScopedRouter.use('/dsr', dsrAdminRoutes);
appScopedRouter.use('/dsr-requests', dsrAdminRoutes);
router.use('/apps/:appId', appScopedRouter);

module.exports = router;
