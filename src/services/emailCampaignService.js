const { EmailCampaign, EmailTemplate, EmailSubscriber } = require('../models');
const emailService = require('./emailService');
const logger = require('../config/logger');

/**
 * Create email campaign
 */
const createCampaign = async (data, userId) => {
  try {
    const campaign = await EmailCampaign.create({
      name: data.name,
      description: data.description,
      template_id: data.template_id,
      status: 'draft',
      campaign_type: data.campaign_type,
      subject_line: data.subject_line,
      preview_text: data.preview_text,
      from_name: data.from_name || 'DeskMain',
      from_email: data.from_email || process.env.FROM_EMAIL,
      reply_to: data.reply_to,
      variables: data.variables || {},
      created_by: userId,
    });

    logger.info(`Campaign created: ${campaign.id}`);
    return campaign;
  } catch (error) {
    logger.error('Create campaign error:', error);
    throw error;
  }
};

/**
 * Get campaign by ID
 */
const getCampaign = async (campaignId) => {
  try {
    const campaign = await EmailCampaign.findByPk(campaignId, {
      include: [
        { model: EmailTemplate, attributes: ['id', 'name', 'subject_line'] },
      ],
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    return campaign;
  } catch (error) {
    logger.error('Get campaign error:', error);
    throw error;
  }
};

/**
 * Get all campaigns
 */
const getAllCampaigns = async (filters = {}) => {
  try {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.campaign_type) where.campaign_type = filters.campaign_type;

    const campaigns = await EmailCampaign.findAll({
      where,
      include: [
        { model: EmailTemplate, attributes: ['id', 'name'] },
      ],
      order: [['created_at', 'DESC']],
    });

    return campaigns;
  } catch (error) {
    logger.error('Get all campaigns error:', error);
    throw error;
  }
};

/**
 * Update campaign
 */
const updateCampaign = async (campaignId, data) => {
  try {
    const campaign = await EmailCampaign.findByPk(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Don't allow update if campaign is in progress or completed
    if (['in_progress', 'completed'].includes(campaign.status)) {
      throw new Error('Cannot update campaign in progress or completed');
    }

    await campaign.update(data);
    logger.info(`Campaign updated: ${campaignId}`);
    return campaign;
  } catch (error) {
    logger.error('Update campaign error:', error);
    throw error;
  }
};

/**
 * Schedule campaign
 */
const scheduleCampaign = async (campaignId, scheduledAt) => {
  try {
    const campaign = await EmailCampaign.findByPk(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    await campaign.update({
      status: 'scheduled',
      scheduled_at: scheduledAt,
    });

    logger.info(`Campaign scheduled: ${campaignId} for ${scheduledAt}`);
    return campaign;
  } catch (error) {
    logger.error('Schedule campaign error:', error);
    throw error;
  }
};

/**
 * Send campaign
 */
const sendCampaign = async (campaignId, targetSubscribers = null) => {
  try {
    const campaign = await EmailCampaign.findByPk(campaignId, {
      include: [{ model: EmailTemplate }],
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (!campaign.EmailTemplate) {
      throw new Error('Campaign template not found');
    }

    // Get subscribers
    let subscribers = targetSubscribers;
    if (!subscribers) {
      subscribers = await EmailSubscriber.findAll({
        where: { status: 'subscribed' },
      });
    }

    if (subscribers.length === 0) {
      throw new Error('No subscribers to send to');
    }

    // Update campaign status
    await campaign.update({
      status: 'in_progress',
      started_at: new Date(),
      total_recipients: subscribers.length,
    });

    // Send emails
    let sentCount = 0;
    const errors = [];

    for (const subscriber of subscribers) {
      try {
        await emailService.sendEmail({
          to: subscriber.email,
          subject: campaign.subject_line || campaign.EmailTemplate.subject_line,
          html: campaign.EmailTemplate.html_content,
          fromName: campaign.from_name,
          fromEmail: campaign.from_email,
          replyTo: campaign.reply_to,
          campaignId: campaign.id,
          subscriberId: subscriber.id,
        });

        sentCount++;
      } catch (error) {
        logger.error(`Failed to send to ${subscriber.email}:`, error);
        errors.push({ email: subscriber.email, error: error.message });
      }
    }

    // Update campaign stats
    await campaign.update({
      sent_count: sentCount,
      status: 'completed',
      completed_at: new Date(),
    });

    logger.info(`Campaign sent: ${campaignId} to ${sentCount} subscribers`);
    return {
      campaign,
      sentCount,
      totalRecipients: subscribers.length,
      errors,
    };
  } catch (error) {
    logger.error('Send campaign error:', error);
    throw error;
  }
};

/**
 * Get campaign statistics
 */
const getCampaignStats = async (campaignId) => {
  try {
    const campaign = await EmailCampaign.findByPk(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const openRate = campaign.total_recipients > 0
      ? ((campaign.opened_count / campaign.total_recipients) * 100).toFixed(2)
      : 0;

    const clickRate = campaign.total_recipients > 0
      ? ((campaign.clicked_count / campaign.total_recipients) * 100).toFixed(2)
      : 0;

    return {
      campaign_id: campaign.id,
      name: campaign.name,
      total_recipients: campaign.total_recipients,
      sent: campaign.sent_count,
      delivered: campaign.delivered_count,
      opened: campaign.opened_count,
      clicked: campaign.clicked_count,
      unsubscribed: campaign.unsubscribed_count,
      bounced: campaign.bounced_count,
      complained: campaign.complained_count,
      open_rate: `${openRate}%`,
      click_rate: `${clickRate}%`,
    };
  } catch (error) {
    logger.error('Get campaign stats error:', error);
    throw error;
  }
};

/**
 * Delete campaign
 */
const deleteCampaign = async (campaignId) => {
  try {
    const campaign = await EmailCampaign.findByPk(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status === 'in_progress') {
      throw new Error('Cannot delete campaign in progress');
    }

    await campaign.destroy();
    logger.info(`Campaign deleted: ${campaignId}`);
    return true;
  } catch (error) {
    logger.error('Delete campaign error:', error);
    throw error;
  }
};

module.exports = {
  createCampaign,
  getCampaign,
  getAllCampaigns,
  updateCampaign,
  scheduleCampaign,
  sendCampaign,
  getCampaignStats,
  deleteCampaign,
};
