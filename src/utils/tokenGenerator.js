const crypto = require('crypto');
const { VerificationToken } = require('../models');

/**
 * Generate a secure token for email verification or password reset
 * @returns {string} A secure random token
 */
const generateSecureToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Create a verification token for a user
 * @param {number} userId - The user ID
 * @param {string} tokenType - Type of token (email_verification, password_reset, 2fa_setup)
 * @param {number} expiresInHours - Hours until token expires (default: 24)
 * @returns {Promise<object>} Created token record
 */
const createVerificationToken = async (userId, tokenType, expiresInHours = 24) => {
  const token = generateSecureToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);

  const verificationToken = await VerificationToken.create({
    user_id: userId,
    token: token,
    type: tokenType,
    expires_at: expiresAt,
  });

  return {
    token: token,
    id: verificationToken.id,
    expires_at: expiresAt,
  };
};

/**
 * Verify a token and get the associated user
 * @param {string} token - The token to verify
 * @param {string} tokenType - Expected token type
 * @returns {Promise<object>} The verification token record if valid
 */
const verifyToken = async (token, tokenType) => {
  const verificationToken = await VerificationToken.findOne({
    where: {
      token: token,
      type: tokenType,
    },
    include: ['User'],
  });

  if (!verificationToken) {
    throw new Error('Invalid token');
  }

  if (verificationToken.isExpired()) {
    throw new Error('Token has expired');
  }

  if (verificationToken.isUsed()) {
    throw new Error('Token has already been used');
  }

  return verificationToken;
};

/**
 * Mark a token as used
 * @param {number} tokenId - The token ID
 * @returns {Promise<object>} Updated token record
 */
const markTokenAsUsed = async (tokenId) => {
  return await VerificationToken.update(
    { used_at: new Date() },
    { where: { id: tokenId } }
  );
};

/**
 * Generate backup codes for 2FA
 * @param {number} count - Number of codes to generate (default: 10)
 * @returns {array} Array of backup codes
 */
const generateBackupCodes = (count = 10) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    codes.push(generateSecureToken().substring(0, 8).toUpperCase());
  }
  return codes;
};

module.exports = {
  generateSecureToken,
  createVerificationToken,
  verifyToken,
  markTokenAsUsed,
  generateBackupCodes,
};
