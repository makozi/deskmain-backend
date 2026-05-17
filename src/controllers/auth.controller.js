const { User, VerificationToken, TwoFactorAuth } = require('../models');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../middleware/auth');
const { createVerificationToken, verifyToken, markTokenAsUsed, generateBackupCodes } = require('../utils/tokenGenerator');
const logger = require('../config/logger');
const { validationResult } = require('express-validator');
const emailService = require('../services/emailService');
const jwt = require('jsonwebtoken');

// User Registration
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', details: errors.array() } });
    }

    const { email, password, first_name, last_name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(422).json({ error: { code: 'EMAIL_EXISTS', message: 'Email already registered' } });
    }

    // Create user
    const user = await User.create({
      email,
      password_hash: password,
      first_name,
      last_name,
      role: 'buyer',
      is_active: false, // User not active until email verified
    });

    // Generate verification token
    const verificationTokenData = await createVerificationToken(user.id, 'email_verification');

    // Send verification email
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationTokenData.token}`;
      await emailService.sendVerificationEmail(user.email, user.first_name, verificationUrl);
    } catch (emailError) {
      logger.error('Failed to send verification email:', emailError);
      // Don't fail registration if email sending fails, user can request resend
    }

    logger.info(`User registered: ${email}, verification token sent`);

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Registration failed' } });
  }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: { code: 'MISSING_TOKEN', message: 'Verification token required' } });
    }

    // Verify token
    const verificationToken = await verifyToken(token, 'email_verification');
    const user = verificationToken.User || await User.findByPk(verificationToken.user_id);

    if (!user) {
      return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
    }

    // Mark email as verified and activate user
    await Promise.all([
      user.update({ email_verified_at: new Date(), is_active: true }),
      markTokenAsUsed(verificationToken.id),
    ]);

    // Generate tokens for login
    const access_token = generateToken(user.id, user.role);
    const refresh_token = generateRefreshToken(user.id);

    logger.info(`User email verified: ${user.email}`);

    res.json({
      message: 'Email verified successfully',
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Email verification error:', error);
    const message = error.message || 'Verification failed';
    res.status(400).json({ error: { code: 'VERIFICATION_FAILED', message } });
  }
};

// Resend Verification Email
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: { code: 'MISSING_EMAIL', message: 'Email required' } });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
    }

    if (user.email_verified_at) {
      return res.status(400).json({ error: { code: 'EMAIL_ALREADY_VERIFIED', message: 'Email already verified' } });
    }

    // Generate new verification token
    const verificationTokenData = await createVerificationToken(user.id, 'email_verification');

    // Send verification email
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationTokenData.token}`;
      await emailService.sendVerificationEmail(user.email, user.first_name, verificationUrl);
    } catch (emailError) {
      logger.error('Failed to send verification email:', emailError);
      return res.status(500).json({ error: { code: 'EMAIL_SEND_FAILED', message: 'Failed to send email' } });
    }

    logger.info(`Verification email resent to: ${email}`);

    res.json({ message: 'Verification email sent successfully' });
  } catch (error) {
    logger.error('Resend verification email error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to resend email' } });
  }
};

// User Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ error: { code: 'USER_INACTIVE', message: 'Please verify your email first' } });
    }

    // Verify password
    const passwordMatch = await user.verifyPassword(password);
    if (!passwordMatch) {
      return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    }

    // Update last login
    await user.update({ last_login_at: new Date() });

    // Check if 2FA is enabled
    const twoFactorAuth = await TwoFactorAuth.findOne({
      where: { user_id: user.id, is_enabled: true },
    });

    if (twoFactorAuth) {
      // Generate temporary token for 2FA verification
      const tempToken = jwt.sign(
        { userId: user.id, type: '2fa_temp' },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
      );

      logger.info(`User login (2FA required): ${email}`);

      return res.json({
        message: '2FA verification required',
        requires_2fa: true,
        temp_token: tempToken,
        two_factor_method: twoFactorAuth.method,
      });
    }

    // Generate tokens
    const access_token = generateToken(user.id, user.role);
    const refresh_token = generateRefreshToken(user.id);

    logger.info(`User logged in: ${email}`);

    res.json({
      message: 'Login successful',
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Login failed' } });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: { code: 'MISSING_EMAIL', message: 'Email required' } });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if user exists for security
      return res.json({ message: 'If that email exists, a password reset link has been sent' });
    }

    // Generate password reset token
    const resetTokenData = await createVerificationToken(user.id, 'password_reset', 1); // 1 hour expiry

    // Send reset email
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetTokenData.token}`;
      await emailService.sendPasswordResetEmail(user.email, user.first_name, resetUrl);
    } catch (emailError) {
      logger.error('Failed to send password reset email:', emailError);
      return res.status(500).json({ error: { code: 'EMAIL_SEND_FAILED', message: 'Failed to send email' } });
    }

    logger.info(`Password reset email sent to: ${email}`);

    res.json({ message: 'If that email exists, a password reset link has been sent' });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to process password reset' } });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password, password_confirm } = req.body;

    if (!token) {
      return res.status(400).json({ error: { code: 'MISSING_TOKEN', message: 'Reset token required' } });
    }

    if (password !== password_confirm) {
      return res.status(400).json({ error: { code: 'PASSWORD_MISMATCH', message: 'Passwords do not match' } });
    }

    // Verify token
    const resetToken = await verifyToken(token, 'password_reset');
    const user = resetToken.User || await User.findByPk(resetToken.user_id);

    if (!user) {
      return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
    }

    // Update password
    await Promise.all([
      user.update({ password_hash: password }),
      markTokenAsUsed(resetToken.id),
    ]);

    logger.info(`Password reset for user: ${user.email}`);

    res.json({ message: 'Password reset successful. You can now login with your new password' });
  } catch (error) {
    logger.error('Reset password error:', error);
    const message = error.message || 'Password reset failed';
    res.status(400).json({ error: { code: 'RESET_FAILED', message } });
  }
};

// Refresh Token
exports.refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ error: { code: 'MISSING_TOKEN', message: 'Refresh token required' } });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refresh_token);

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
    }

    // Generate new access token
    const newAccessToken = generateToken(user.id, user.role);

    res.json({ access_token: newAccessToken });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } });
  }
};

// Google OAuth
exports.googleAuth = async (req, res) => {
  try {
    const { google_token } = req.body;

    if (!google_token) {
      return res.status(400).json({ error: { code: 'MISSING_TOKEN', message: 'Google token required' } });
    }

    // TODO: Verify Google token with Google API
    // For now, this is a placeholder
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    try {
      const ticket = await client.verifyIdToken({
        idToken: google_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      // Find or create user
      let user = await User.findOne({ where: { email: payload.email } });

      if (!user) {
        user = await User.create({
          email: payload.email,
          first_name: payload.given_name || '',
          last_name: payload.family_name || '',
          email_verified_at: new Date(), // Email is already verified by Google
          is_active: true,
          role: 'buyer',
        });
      }

      // Update last login
      await user.update({ last_login_at: new Date() });

      // Generate tokens
      const access_token = generateToken(user.id, user.role);
      const refresh_token = generateRefreshToken(user.id);

      logger.info(`User logged in via Google: ${user.email}`);

      res.json({
        message: 'Google authentication successful',
        access_token,
        refresh_token,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
        },
      });
    } catch (verifyError) {
      logger.error('Google token verification failed:', verifyError);
      return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid Google token' } });
    }
  } catch (error) {
    logger.error('Google auth error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Google authentication failed' } });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } });
    }

    // TODO: Implement token blacklist or revocation
    // For now, logout is handled by removing token from client

    logger.info(`User logged out: ${userId}`);

    res.json({ message: 'Logout successful' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Logout failed' } });
  }
};

// Setup 2FA
exports.setup2FA = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { method } = req.body; // email, sms, or authenticator

    if (!userId) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } });
    }

    if (!['email', 'sms', 'authenticator'].includes(method)) {
      return res.status(400).json({ error: { code: 'INVALID_METHOD', message: 'Invalid 2FA method' } });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
    }

    // Check if 2FA already exists
    let twoFactorAuth = await TwoFactorAuth.findOne({ where: { user_id: userId } });

    if (twoFactorAuth && twoFactorAuth.is_enabled) {
      return res.status(400).json({ error: { code: '2FA_ALREADY_ENABLED', message: '2FA is already enabled' } });
    }

    if (!twoFactorAuth) {
      twoFactorAuth = await TwoFactorAuth.create({
        user_id: userId,
        method: method,
      });
    } else {
      await twoFactorAuth.update({ method: method });
    }

    let response = {
      message: '2FA setup started',
      two_factor_id: twoFactorAuth.id,
      method: method,
    };

    if (method === 'authenticator') {
      // Generate TOTP secret (using speakeasy library)
      const speakeasy = require('speakeasy');
      const secret = speakeasy.generateSecret({
        name: `DeskMain (${user.email})`,
        issuer: 'DeskMain',
      });

      await twoFactorAuth.update({ secret_key: secret.base32 });

      response.secret = secret.base32;
      response.qr_code = secret.otpauth_url;
    } else if (method === 'email') {
      // Send verification code to email
      const verificationCode = Math.random().toString().substring(2, 8);
      await twoFactorAuth.update({ secret_key: verificationCode });

      try {
        await emailService.send2FASetupEmail(user.email, user.first_name, verificationCode);
      } catch (emailError) {
        logger.error('Failed to send 2FA setup email:', emailError);
        return res.status(500).json({ error: { code: 'EMAIL_SEND_FAILED', message: 'Failed to send email' } });
      }

      response.message = '2FA setup code sent to your email';
    }

    logger.info(`2FA setup started for user: ${user.email}, method: ${method}`);

    res.json(response);
  } catch (error) {
    logger.error('2FA setup error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: '2FA setup failed' } });
  }
};

// Verify 2FA Setup
exports.verify2FASetup = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { code } = req.body;

    if (!userId) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } });
    }

    if (!code) {
      return res.status(400).json({ error: { code: 'MISSING_CODE', message: 'Verification code required' } });
    }

    const twoFactorAuth = await TwoFactorAuth.findOne({ where: { user_id: userId } });

    if (!twoFactorAuth) {
      return res.status(404).json({ error: { code: '2FA_NOT_FOUND', message: '2FA setup not found' } });
    }

    let isValid = false;

    if (twoFactorAuth.method === 'authenticator') {
      // Verify TOTP code
      const speakeasy = require('speakeasy');
      isValid = speakeasy.totp.verify({
        secret: twoFactorAuth.secret_key,
        encoding: 'base32',
        token: code,
        window: 2,
      });
    } else if (twoFactorAuth.method === 'email') {
      // Verify code matches
      isValid = code === twoFactorAuth.secret_key;
    }

    if (!isValid) {
      return res.status(400).json({ error: { code: 'INVALID_CODE', message: 'Invalid verification code' } });
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes(10);

    // Enable 2FA
    await twoFactorAuth.update({
      is_enabled: true,
      verified_at: new Date(),
      backup_codes: backupCodes,
    });

    logger.info(`2FA enabled for user: ${userId}, method: ${twoFactorAuth.method}`);

    res.json({
      message: '2FA enabled successfully',
      backup_codes: backupCodes,
      warning: 'Save these backup codes in a safe place. You will need them if you lose access to your 2FA device.',
    });
  } catch (error) {
    logger.error('2FA verification error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: '2FA verification failed' } });
  }
};

// Verify 2FA Code (during login)
exports.verify2FACode = async (req, res) => {
  try {
    const { temp_token, code } = req.body;

    if (!temp_token || !code) {
      return res.status(400).json({ error: { code: 'MISSING_DATA', message: 'Temp token and code required' } });
    }

    // Verify temp token
    let decoded;
    try {
      decoded = jwt.verify(temp_token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ error: { code: 'INVALID_TEMP_TOKEN', message: 'Invalid or expired token' } });
    }

    if (decoded.type !== '2fa_temp') {
      return res.status(401).json({ error: { code: 'INVALID_TOKEN_TYPE', message: 'Invalid token' } });
    }

    const userId = decoded.userId;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
    }

    const twoFactorAuth = await TwoFactorAuth.findOne({
      where: { user_id: userId, is_enabled: true },
    });

    if (!twoFactorAuth) {
      return res.status(404).json({ error: { code: '2FA_NOT_ENABLED', message: '2FA not enabled' } });
    }

    let isValid = false;

    // Check backup code first
    if (twoFactorAuth.backup_codes && twoFactorAuth.backup_codes.includes(code)) {
      // Remove used backup code
      const updatedBackupCodes = twoFactorAuth.backup_codes.filter(c => c !== code);
      await twoFactorAuth.update({ backup_codes: updatedBackupCodes });
      isValid = true;
    } else if (twoFactorAuth.method === 'authenticator') {
      // Verify TOTP code
      const speakeasy = require('speakeasy');
      isValid = speakeasy.totp.verify({
        secret: twoFactorAuth.secret_key,
        encoding: 'base32',
        token: code,
        window: 2,
      });
    } else if (twoFactorAuth.method === 'email') {
      // For email, code was sent and needs to be verified separately
      // This is a simplified implementation
      isValid = code.length > 0; // In production, verify against sent code
    }

    if (!isValid) {
      return res.status(400).json({ error: { code: 'INVALID_CODE', message: 'Invalid 2FA code' } });
    }

    // Generate tokens
    const access_token = generateToken(user.id, user.role);
    const refresh_token = generateRefreshToken(user.id);

    logger.info(`2FA verification successful for user: ${user.email}`);

    res.json({
      message: '2FA verification successful',
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('2FA code verification error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: '2FA verification failed' } });
  }
};
