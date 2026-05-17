import db from '../config/database.js';
import logger from '../config/logger.js';

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const result = await db.query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const unreadResult = await db.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read = false',
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
      unreadCount: parseInt(unreadResult.rows[0].count)
    });
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      'SELECT * FROM notifications WHERE id = $1 AND user_id = $2',
      [notificationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error fetching notification:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      `UPDATE notifications SET read = true, updated_at = NOW()
       WHERE id = $1 AND user_id = $2 RETURNING *`,
      [notificationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await db.query(
      'UPDATE notifications SET read = true, updated_at = NOW() WHERE user_id = $1 AND read = false',
      [userId]
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING *',
      [notificationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    logger.error('Error deleting notification:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    await db.query(
      'DELETE FROM notifications WHERE user_id = $1',
      [userId]
    );

    res.json({
      success: true,
      message: 'All notifications deleted'
    });
  } catch (error) {
    logger.error('Error deleting all notifications:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const createNotification = async (userId, title, message, type = 'system') => {
  try {
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type, read, created_at)
       VALUES ($1, $2, $3, $4, false, NOW())`,
      [userId, title, message, type]
    );

    logger.info(`Notification created for user ${userId}`);
  } catch (error) {
    logger.error('Error creating notification:', error);
  }
};

export const sendBulkNotifications = async (req, res) => {
  try {
    const { userIds, title, message, type = 'system' } = req.body;

    const notifications = userIds.map(userId => [userId, title, message, type, false, new Date()]);

    for (const notif of notifications) {
      await db.query(
        `INSERT INTO notifications (user_id, title, message, type, read, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        notif
      );
    }

    logger.info(`Bulk notifications sent to ${userIds.length} users`);
    res.json({
      success: true,
      message: `Notifications sent to ${userIds.length} users`
    });
  } catch (error) {
    logger.error('Error sending bulk notifications:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
