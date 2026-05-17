const { EmailSubscriber } = require('../models');
const logger = require('../config/logger');

/**
 * Subscribe email
 */
const subscribeEmail = async (email, data = {}) => {
  try {
    // Check if already exists
    let subscriber = await EmailSubscriber.findOne({ where: { email } });

    if (subscriber) {
      // Reactivate if unsubscribed
      if (subscriber.status !== 'subscribed') {
        await subscriber.update({
          status: 'subscribed',
          preferences: data.preferences || subscriber.preferences,
        });
      }
      return subscriber;
    }

    // Create new subscriber
    subscriber = await EmailSubscriber.create({
      email,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      status: 'subscribed',
      preferences: data.preferences || {
        email_frequency: 'weekly',
        newsletter: true,
        promotional: true,
        product_updates: true,
      },
      subscription_source: data.source || 'website',
    });

    logger.info(`Subscriber created: ${email}`);
    return subscriber;
  } catch (error) {
    logger.error('Subscribe email error:', error);
    throw error;
  }
};

/**
 * Unsubscribe email
 */
const unsubscribeEmail = async (email) => {
  try {
    const subscriber = await EmailSubscriber.findOne({ where: { email } });
    if (!subscriber) {
      throw new Error('Subscriber not found');
    }

    await subscriber.update({ status: 'unsubscribed' });
    logger.info(`Subscriber unsubscribed: ${email}`);
    return subscriber;
  } catch (error) {
    logger.error('Unsubscribe error:', error);
    throw error;
  }
};

/**
 * Get subscriber by email
 */
const getSubscriber = async (email) => {
  try {
    const subscriber = await EmailSubscriber.findOne({ where: { email } });
    if (!subscriber) {
      throw new Error('Subscriber not found');
    }
    return subscriber;
  } catch (error) {
    logger.error('Get subscriber error:', error);
    throw error;
  }
};

/**
 * Update subscriber
 */
const updateSubscriber = async (email, data) => {
  try {
    const subscriber = await EmailSubscriber.findOne({ where: { email } });
    if (!subscriber) {
      throw new Error('Subscriber not found');
    }

    await subscriber.update(data);
    logger.info(`Subscriber updated: ${email}`);
    return subscriber;
  } catch (error) {
    logger.error('Update subscriber error:', error);
    throw error;
  }
};

/**
 * Get all subscribers
 */
const getAllSubscribers = async (filters = {}) => {
  try {
    const where = {};
    if (filters.status) where.status = filters.status;

    const subscribers = await EmailSubscriber.findAll({
      where: where || { status: 'subscribed' },
      order: [['created_at', 'DESC']],
    });

    return subscribers;
  } catch (error) {
    logger.error('Get all subscribers error:', error);
    throw error;
  }
};

/**
 * Update subscriber preferences
 */
const updatePreferences = async (email, preferences) => {
  try {
    const subscriber = await EmailSubscriber.findOne({ where: { email } });
    if (!subscriber) {
      throw new Error('Subscriber not found');
    }

    const updatedPreferences = {
      ...subscriber.preferences,
      ...preferences,
    };

    await subscriber.update({ preferences: updatedPreferences });
    logger.info(`Preferences updated for: ${email}`);
    return subscriber;
  } catch (error) {
    logger.error('Update preferences error:', error);
    throw error;
  }
};

/**
 * Bulk subscribe emails
 */
const bulkSubscribe = async (emails) => {
  try {
    const subscribers = [];

    for (const email of emails) {
      const subscriber = await subscribeEmail(email);
      subscribers.push(subscriber);
    }

    logger.info(`Bulk subscribed ${subscribers.length} emails`);
    return subscribers;
  } catch (error) {
    logger.error('Bulk subscribe error:', error);
    throw error;
  }
};

/**
 * Get subscriber count by status
 */
const getCountByStatus = async () => {
  try {
    const counts = await EmailSubscriber.findAll({
      attributes: [
        'status',
        [require('sequelize').fn('count', require('sequelize').col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });

    return counts;
  } catch (error) {
    logger.error('Get count by status error:', error);
    throw error;
  }
};

module.exports = {
  subscribeEmail,
  unsubscribeEmail,
  getSubscriber,
  updateSubscriber,
  getAllSubscribers,
  updatePreferences,
  bulkSubscribe,
  getCountByStatus,
};
