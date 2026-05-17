const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@deskmain.com';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@deskmain.com';

/**
 * Send verification email
 */
const sendVerificationEmail = async (toEmail, userName, verificationUrl) => {
  const msg = {
    to: toEmail,
    from: FROM_EMAIL,
    subject: 'Verify your DeskMain account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to DeskMain!</h2>
        <p>Hi ${userName},</p>
        <p>Thank you for registering with DeskMain. To complete your account setup, please verify your email address by clicking the button below:</p>
        <p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
        </p>
        <p>Or copy and paste this link in your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <hr>
        <p>If you didn't create this account, please ignore this email.</p>
        <p>Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
      </div>
    `,
  };

  return sgMail.send(msg);
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (toEmail, userName, resetUrl) => {
  const msg = {
    to: toEmail,
    from: FROM_EMAIL,
    subject: 'Reset your DeskMain password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hi ${userName},</p>
        <p>We received a request to reset your password. Click the button below to set a new password:</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link in your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <hr>
        <p>If you didn't request a password reset, please ignore this email.</p>
        <p>Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
      </div>
    `,
  };

  return sgMail.send(msg);
};

/**
 * Send 2FA setup email with code
 */
const send2FASetupEmail = async (toEmail, userName, code) => {
  const msg = {
    to: toEmail,
    from: FROM_EMAIL,
    subject: 'Complete your 2FA setup',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Two-Factor Authentication Setup</h2>
        <p>Hi ${userName},</p>
        <p>Your verification code for setting up two-factor authentication is:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center;">
          ${code}
        </p>
        <p>This code will expire in 30 minutes.</p>
        <hr>
        <p>If you didn't request to set up 2FA, please ignore this email.</p>
        <p>Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
      </div>
    `,
  };

  return sgMail.send(msg);
};

/**
 * Send 2FA login code
 */
const send2FALoginEmail = async (toEmail, userName, code) => {
  const msg = {
    to: toEmail,
    from: FROM_EMAIL,
    subject: 'Your DeskMain login code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Login Verification Code</h2>
        <p>Hi ${userName},</p>
        <p>Your verification code for logging in to DeskMain is:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center;">
          ${code}
        </p>
        <p>This code will expire in 10 minutes.</p>
        <hr>
        <p>If you didn't attempt to log in, please ignore this email and your account will remain secure.</p>
        <p>Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
      </div>
    `,
  };

  return sgMail.send(msg);
};

/**
 * Send welcome email after successful registration
 */
const sendWelcomeEmail = async (toEmail, userName) => {
  const msg = {
    to: toEmail,
    from: FROM_EMAIL,
    subject: 'Welcome to DeskMain!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to DeskMain, ${userName}!</h2>
        <p>Your account has been successfully created.</p>
        <p>You can now:</p>
        <ul>
          <li>Browse and purchase products</li>
          <li>Manage your orders</li>
          <li>Become a merchant seller</li>
          <li>Join our affiliate program</li>
        </ul>
        <p>
          <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            Go to Dashboard
          </a>
        </p>
        <hr>
        <p>Questions? Check out our help center or contact support at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
      </div>
    `,
  };

  return sgMail.send(msg);
};

/**
 * Send generic email
 */
const sendEmail = async (toEmail, subject, html) => {
  const msg = {
    to: toEmail,
    from: FROM_EMAIL,
    subject,
    html,
  };

  return sgMail.send(msg);
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  send2FASetupEmail,
  send2FALoginEmail,
  sendWelcomeEmail,
  sendEmail,
};
