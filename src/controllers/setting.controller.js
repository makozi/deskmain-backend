import db from '../config/database.js';
import logger from '../config/logger.js';

export const getSettings = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      // Create default settings
      const defaultSettings = await db.query(
        `INSERT INTO user_settings (user_id, theme, notifications_email, notifications_push, language, created_at)
         VALUES ($1, 'light', true, true, 'en', NOW())
         RETURNING *`,
        [userId]
      );
      return res.json({
        success: true,
        data: defaultSettings.rows[0]
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error fetching settings:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { theme, notificationsEmail, notificationsPush, language, currency } = req.body;

    const result = await db.query(
      `UPDATE user_settings
       SET theme = COALESCE($1, theme),
           notifications_email = COALESCE($2, notifications_email),
           notifications_push = COALESCE($3, notifications_push),
           language = COALESCE($4, language),
           currency = COALESCE($5, currency),
           updated_at = NOW()
       WHERE user_id = $6
       RETURNING *`,
      [theme, notificationsEmail, notificationsPush, language, currency, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }

    logger.info(`Settings updated for user ${userId}`);
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error updating settings:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getEmailPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      'SELECT * FROM email_preferences WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      // Create default preferences
      const defaultPrefs = await db.query(
        `INSERT INTO email_preferences (user_id, newsletter, promotional, updates, transactional, created_at)
         VALUES ($1, true, false, true, true, NOW())
         RETURNING *`,
        [userId]
      );
      return res.json({
        success: true,
        data: defaultPrefs.rows[0]
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error fetching email preferences:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const updateEmailPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newsletter, promotional, updates, transactional } = req.body;

    const result = await db.query(
      `UPDATE email_preferences
       SET newsletter = COALESCE($1, newsletter),
           promotional = COALESCE($2, promotional),
           updates = COALESCE($3, updates),
           transactional = COALESCE($4, transactional),
           updated_at = NOW()
       WHERE user_id = $5
       RETURNING *`,
      [newsletter, promotional, updates, transactional, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Preferences not found'
      });
    }

    logger.info(`Email preferences updated for user ${userId}`);
    res.json({
      success: true,
      message: 'Email preferences updated',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error updating email preferences:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getPrivacySettings = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      'SELECT * FROM privacy_settings WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      // Create default privacy settings
      const defaultSettings = await db.query(
        `INSERT INTO privacy_settings (user_id, profile_public, show_activity, data_collection, created_at)
         VALUES ($1, false, false, false, NOW())
         RETURNING *`,
        [userId]
      );
      return res.json({
        success: true,
        data: defaultSettings.rows[0]
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error fetching privacy settings:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const updatePrivacySettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { profilePublic, showActivity, dataCollection } = req.body;

    const result = await db.query(
      `UPDATE privacy_settings
       SET profile_public = COALESCE($1, profile_public),
           show_activity = COALESCE($2, show_activity),
           data_collection = COALESCE($3, data_collection),
           updated_at = NOW()
       WHERE user_id = $4
       RETURNING *`,
      [profilePublic, showActivity, dataCollection, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Privacy settings not found'
      });
    }

    logger.info(`Privacy settings updated for user ${userId}`);
    res.json({
      success: true,
      message: 'Privacy settings updated',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error updating privacy settings:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    // Verify password
    const userResult = await db.query(
      'SELECT password FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Note: In production, verify password using proper hashing
    // This is simplified for demonstration

    // Soft delete: mark account as deleted
    await db.query(
      'UPDATE users SET deleted_at = NOW() WHERE id = $1',
      [userId]
    );

    logger.info(`Account deleted for user ${userId}`);
    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting account:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getSystemSettings = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM system_settings WHERE id = 1'
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: {}
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error fetching system settings:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
