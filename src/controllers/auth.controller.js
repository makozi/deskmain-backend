const { User } = require('../models');
const { generateToken, generateRefreshToken } = require('../middleware/auth');
const logger = require('../config/logger');
const { validationResult } = require('express-validator');

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
    });

    // Generate tokens
    const access_token = generateToken(user.id, user.role);
    const refresh_token = generateRefreshToken(user.id);

    logger.info(`User registered: ${email}`);

    res.status(201).json({
      message: 'Registration successful',
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
    logger.error('Registration error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Registration failed' } });
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

    // Verify password
    const passwordMatch = await user.verifyPassword(password);
    if (!passwordMatch) {
      return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    }

    // Update last login
    await user.update({ last_login_at: new Date() });

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

// Verify Email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    // TODO: Implement email verification token logic
    res.json({ message: 'Email verified' });
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Verification failed' } });
  }
};

// Refresh Token
exports.refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return res.status(400).json({ error: { code: 'MISSING_TOKEN', message: 'Refresh token required' } });
    }

    // TODO: Verify refresh token and issue new access token
    const newAccessToken = generateToken(req.user?.id, req.user?.role);

    res.json({ access_token: newAccessToken });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Token refresh failed' } });
  }
};

// Google OAuth (Placeholder)
exports.googleAuth = async (req, res) => {
  try {
    const { google_token } = req.body;
    // TODO: Implement Google OAuth verification
    res.json({ message: 'Google authentication successful' });
  } catch (error) {
    logger.error('Google auth error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Google auth failed' } });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    // TODO: Implement token blacklist or revocation
    res.json({ message: 'Logout successful' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Logout failed' } });
  }
};
