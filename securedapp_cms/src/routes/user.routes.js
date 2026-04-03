const express = require('express');
const userController = require('../controllers/user.controller');
const { requireUserPortal } = require('../middleware/userPortal.middleware');
const { authLimiter } = require('../config/security');
const {
  portalSessionValidation,
  consentsQueryValidation,
  appsQueryValidation,
  dsrListQueryValidation,
  dsrSubmitValidation,
  handleValidationErrors,
} = require('../validators/userPortal.validator');

const router = express.Router();

router.post(
  '/auth/session',
  authLimiter,
  portalSessionValidation,
  handleValidationErrors,
  userController.postSession
);

router.get('/me', requireUserPortal, userController.getMe);
router.get('/consents', requireUserPortal, consentsQueryValidation, handleValidationErrors, userController.getConsents);
router.get('/summary', requireUserPortal, userController.getSummary);
router.get('/tenants', requireUserPortal, userController.getTenants);
router.get('/apps', requireUserPortal, appsQueryValidation, handleValidationErrors, userController.getApps);

router.get(
  '/dsr/requests',
  requireUserPortal,
  dsrListQueryValidation,
  handleValidationErrors,
  userController.getDsrRequests
);
router.post(
  '/dsr/request',
  requireUserPortal,
  dsrSubmitValidation,
  handleValidationErrors,
  userController.postDsrRequest
);

module.exports = router;
