const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('first_name').trim().notEmpty(),
  body('last_name').trim().notEmpty(),
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

const validateResetPassword = [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 }),
  body('password_confirm').notEmpty(),
];

const validateForgotPassword = [
  body('email').isEmail().normalizeEmail(),
];

const validateVerifyEmail = [
  body('token').notEmpty(),
];

const validateResendVerification = [
  body('email').isEmail().normalizeEmail(),
];

// Public routes
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/verify-email', validateVerifyEmail, authController.verifyEmail);
router.post('/resend-verification', validateResendVerification, authController.resendVerificationEmail);
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.post('/reset-password', validateResetPassword, authController.resetPassword);
router.post('/google', authController.googleAuth);
router.post('/verify-2fa', authController.verify2FACode);

// Protected routes
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', verifyToken, authController.logout);
router.post('/setup-2fa', verifyToken, authController.setup2FA);
router.post('/verify-2fa-setup', verifyToken, authController.verify2FASetup);

module.exports = router;
