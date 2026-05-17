const crypto = require('crypto');
const emailAnalyticsService = require('../services/emailAnalyticsService');
const emailSubscriberService = require('../services/emailSubscriberService');
const { EmailCampaignSubscribers } = require('../models');
const logger = require('../config/logger');

/**
 * Verify SendGrid webhook signature
 */
const verifySendGridSignature = (req) => {
  try {
    const signature = req.get('X-Twilio-Email-Event-Webhook-Signature');
    const timestamp = req.get('X-Twilio-Email-Event-Webhook-Timestamp');
    const sendgridKey = process.env.SENDGRID_WEBHOOK_KEY;

    if (!signature || !timestamp || !sendgridKey) {
      return false;
    }

    const verificationString = timestamp + req.rawBody;
    const hash = crypto
      .createHmac('sha256', sendgridKey)
      .update(verificationString)
      .digest('base64');

    return hash === signature;
  } catch (error) {
    logger.error(`Signature verification error: ${error.message}`);
    return false;
  }
};

/**
 * Handle SendGrid webhook events
 */
exports.handleSendGridWebhook = async (req, res) => {
  try {
    // Verify webhook signature
    if (!verifySendGridSignature(req)) {
      logger.warn('Invalid SendGrid webhook signature');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const events = req.body;

    // Process each event
    for (const event of events) {
      await processSendGridEvent(event);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error(`SendGrid webhook error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Process individual SendGrid event
 */
async function processSendGridEvent(event) {
  try {
    const { event: eventType, sg_message_id, email, timestamp } = event;

    switch (eventType) {
      case 'delivered':
        await handleDelivered(event);
        break;
      case 'open':
        await handleOpen(event);
        break;
      case 'click':
        await handleClick(event);
        break;
      case 'bounce':
        await handleBounce(event);
        break;
      case 'dropped':
        await handleDropped(event);
        break;
      case 'spamreport':
        await handleSpamReport(event);
        break;
      case 'unsubscribe':
        await handleUnsubscribe(event);
        break;
      case 'group_unsubscribe':
        await handleGroupUnsubscribe(event);
        break;
      default:
        logger.info(`Unknown event type: ${eventType}`);
    }
  } catch (error) {
    logger.error(`Error processing SendGrid event: ${error.message}`);
  }
}

/**
 * Handle delivery event
 */
async function handleDelivered(event) {
  try {
    const { email, sg_message_id, timestamp } = event;

    await emailAnalyticsService.recordEvent({
      recipient_email: email,
      message_id: sg_message_id,
      status: 'delivered',
      event_type: 'delivery',
      event_data: event,
    });

    logger.info(`Email delivered: ${email}`);
  } catch (error) {
    logger.error(`Error handling delivery event: ${error.message}`);
  }
}

/**
 * Handle open event
 */
async function handleOpen(event) {
  try {
    const { email, sg_message_id, timestamp, useragent, ip } = event;

    await emailAnalyticsService.recordEvent({
      recipient_email: email,
      message_id: sg_message_id,
      status: 'opened',
      event_type: 'open',
      event_data: {
        useragent,
        ip,
        timestamp,
      },
    });

    logger.info(`Email opened: ${email}`);
  } catch (error) {
    logger.error(`Error handling open event: ${error.message}`);
  }
}

/**
 * Handle click event
 */
async function handleClick(event) {
  try {
    const { email, sg_message_id, timestamp, url, useragent, ip } = event;

    await emailAnalyticsService.recordEvent({
      recipient_email: email,
      message_id: sg_message_id,
      status: 'clicked',
      event_type: 'click',
      event_data: {
        url,
        useragent,
        ip,
        timestamp,
      },
    });

    logger.info(`Email link clicked: ${email} -> ${url}`);
  } catch (error) {
    logger.error(`Error handling click event: ${error.message}`);
  }
}

/**
 * Handle bounce event
 */
async function handleBounce(event) {
  try {
    const { email, sg_message_id, timestamp, bounce_type, reason } = event;

    // Update subscriber status
    try {
      const subscriber = await emailSubscriberService.getSubscriber(email);
      if (subscriber) {
        await subscriber.increment('bounce_count');
        
        if (bounce_type === 'permanent') {
          await subscriber.update({ status: 'bounced' });
        }
      }
    } catch (error) {
      logger.warn(`Could not update subscriber for bounce: ${email}`);
    }

    await emailAnalyticsService.recordEvent({
      recipient_email: email,
      message_id: sg_message_id,
      status: 'bounced',
      event_type: 'bounce',
      event_data: {
        bounce_type,
        reason,
        timestamp,
      },
    });

    logger.info(`Email bounced: ${email} (${bounce_type})`);
  } catch (error) {
    logger.error(`Error handling bounce event: ${error.message}`);
  }
}

/**
 * Handle dropped event
 */
async function handleDropped(event) {
  try {
    const { email, sg_message_id, timestamp, reason, smtp_code, smtp_reason } = event;

    await emailAnalyticsService.recordEvent({
      recipient_email: email,
      message_id: sg_message_id,
      status: 'dropped',
      event_type: 'bounce',
      error_message: `${reason}: ${smtp_reason}`,
      event_data: {
        smtp_code,
        smtp_reason,
        timestamp,
      },
    });

    logger.warn(`Email dropped: ${email} - ${reason}`);
  } catch (error) {
    logger.error(`Error handling dropped event: ${error.message}`);
  }
}

/**
 * Handle spam report
 */
async function handleSpamReport(event) {
  try {
    const { email, sg_message_id, timestamp } = event;

    // Update subscriber
    try {
      const subscriber = await emailSubscriberService.getSubscriber(email);
      if (subscriber) {
        await subscriber.increment('complaint_count');
        if (subscriber.complaint_count >= 3) {
          await subscriber.update({ status: 'invalid' });
        }
      }
    } catch (error) {
      logger.warn(`Could not update subscriber for spam report: ${email}`);
    }

    await emailAnalyticsService.recordEvent({
      recipient_email: email,
      message_id: sg_message_id,
      status: 'complained',
      event_type: 'complaint',
      event_data: { timestamp },
    });

    logger.warn(`Spam report: ${email}`);
  } catch (error) {
    logger.error(`Error handling spam report: ${error.message}`);
  }
}

/**
 * Handle unsubscribe event
 */
async function handleUnsubscribe(event) {
  try {
    const { email, sg_message_id, timestamp } = event;

    await emailSubscriberService.unsubscribeEmail(email);

    await emailAnalyticsService.recordEvent({
      recipient_email: email,
      message_id: sg_message_id,
      status: 'unsubscribed',
      event_type: 'unsubscribe',
      event_data: { timestamp },
    });

    logger.info(`Email unsubscribed: ${email}`);
  } catch (error) {
    logger.error(`Error handling unsubscribe event: ${error.message}`);
  }
}

/**
 * Handle group unsubscribe
 */
async function handleGroupUnsubscribe(event) {
  try {
    const { email, sg_message_id, timestamp, asm_group_id } = event;

    // Update subscriber preferences instead of fully unsubscribing
    try {
      const subscriber = await emailSubscriberService.getSubscriber(email);
      if (subscriber) {
        const preferences = subscriber.preferences || {};
        preferences[`group_${asm_group_id}`] = false;
        await subscriber.update({ preferences });
      }
    } catch (error) {
      logger.warn(`Could not update subscriber preferences: ${email}`);
    }

    await emailAnalyticsService.recordEvent({
      recipient_email: email,
      message_id: sg_message_id,
      status: 'group_unsubscribed',
      event_type: 'unsubscribe',
      event_data: { asm_group_id, timestamp },
    });

    logger.info(`Group unsubscribe: ${email} from group ${asm_group_id}`);
  } catch (error) {
    logger.error(`Error handling group unsubscribe: ${error.message}`);
  }
}

/**
 * Get webhook status
 */
exports.getWebhookStatus = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      status: 'webhook active',
      message: 'SendGrid webhook is configured and receiving events',
    });
  } catch (error) {
    logger.error(`Webhook status error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
};
