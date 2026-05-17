const emailTemplateService = require('../services/emailTemplateService');
const emailSubscriberService = require('../services/emailSubscriberService');
const emailCampaignService = require('../services/emailCampaignService');
const emailSequenceService = require('../services/emailSequenceService');
const emailAnalyticsService = require('../services/emailAnalyticsService');
const emailAutomationService = require('../services/emailAutomationService');
const logger = require('../config/logger');

/**
 * EMAIL TEMPLATE ENDPOINTS
 */

exports.createTemplate = async (req, res) => {
  try {
    const { name, slug, subject_line, html_content, plain_text_content, variables, category } = req.body;

    const template = await emailTemplateService.createTemplate({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      subject_line,
      html_content,
      plain_text_content,
      variables: variables || [],
      category,
    }, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Email template created successfully',
      data: template,
    });
  } catch (error) {
    logger.error(`Create template error: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message,
      error_code: 'CREATE_TEMPLATE_FAILED',
    });
  }
};

exports.getTemplate = async (req, res) => {
  try {
    const template = await emailTemplateService.getTemplate(req.params.id);

    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    logger.error(`Get template error: ${error.message}`);
    res.status(404).json({
      success: false,
      message: error.message,
      error_code: 'TEMPLATE_NOT_FOUND',
    });
  }
};

exports.getAllTemplates = async (req, res) => {
  try {
    const { category } = req.query;
    const templates = await emailTemplateService.getAllTemplates({ category });

    res.status(200).json({
      success: true,
      data: templates,
      count: templates.length,
    });
  } catch (error) {
    logger.error(`Get templates error: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message,
      error_code: 'GET_TEMPLATES_FAILED',
    });
  }
};

exports.updateTemplate = async (req, res) => {
  try {
    const template = await emailTemplateService.updateTemplate(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Email template updated successfully',
      data: template,
    });
  } catch (error) {
    logger.error(`Update template error: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message,
      error_code: 'UPDATE_TEMPLATE_FAILED',
    });
  }
};

exports.deleteTemplate = async (req, res) => {
  try {
    await emailTemplateService.deleteTemplate(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Email template deleted successfully',
    });
  } catch (error) {
    logger.error(`Delete template error: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message,
      error_code: 'DELETE_TEMPLATE_FAILED',
    });
  }
};

/**
 * EMAIL SUBSCRIBER ENDPOINTS
 */

exports.subscribeEmail = async (req, res) => {
  try {
    const { email, first_name, last_name, phone, subscription_source } = req.body;

    const subscriber = await emailSubscriberService.subscribeEmail(email, {
      first_name,
      last_name,
      phone,
      subscription_source: subscription_source || 'website',
    });

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to email list',
      data: subscriber,
    });
  } catch (error) {
    logger.error(`Subscribe error: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message,
      error_code: 'SUBSCRIPTION_FAILED',
    });
  }
};

exports.unsubscribeEmail = async (req, res) => {
  try {
    const { email } = req.body;

    await emailSubscriberService.unsubscribeEmail(email);

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from email list',
    });
  } catch (error) {
    logger.error(`Unsubscribe error: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message,
      error_code: 'UNSUBSCRIBE_FAILED',
    });
  }
};

exports.getSubscriber = async (req, res) => {
  try {
    const subscriber = await emailSubscriberService.getSubscriber(req.params.email);

    res.status(200).json({
      success: true,
      data: subscriber,
    });
  } catch (error) {
    logger.error(`Get subscriber error: ${error.message}`);
    res.status(404).json({
      success: false,
      message: error.message,
      error_code: 'SUBSCRIBER_NOT_FOUND',
    });
  }
};

exports.getAllSubscribers = async (req, res) => {
  try {
    const { status } = req.query;
    const subscribers = await emailSubscriberService.getAllSubscribers({ status });

    res.status(200).json({
      success: true,
      data: subscribers,
      count: subscribers.length,
    });
  } catch (error) {
    logger.error(`Get subscribers error: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message,
      error_code: 'GET_SUBSCRIBERS_FAILED',
    });
  }
};

exports.updateSubscriberPreferences = async (req, res) => {
  try {
    const { email } = req.params;
    const { preferences } = req.body;

    await emailSubscriberService.updatePreferences(email, preferences);

    res.status(200).json({
      success: true,
      message: 'Subscriber preferences updated',
    });
  } catch (error) {
    logger.error(`Update preferences error: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message,
      error_code: 'UPDATE_PREFERENCES_FAILED',
    });
  }
};

/**
 * EMAIL CAMPAIGN ENDPOINTS
 */

exports.createCampaign = async (req, res) => {
  try {
    const { name, description, template_id, campaign_type, subject_line, from_name, from_email, reply_to, variables } = req.body;

    const campaign = await emailCampaignService.createCampaign({
      name,
      description,
      template_id,
      campaign_type,
      subject_line,
      from_name,
      from_email,
      reply_to,
      variables: variables || {},
    }, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Email campaign created successfully',
      data: campaign,
    });
  } catch (error) {
    logger.error(`Create campaign error: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message,
      error_code: 'CREATE_CAMPAIGN_FAILED',
    });
  }
};

exports.getCampaign = async (req, res) => {
  try {
    const campaign = await emailCampaignService.getCampaign(req.params.id);

    res.status(200).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    logger.error(`Get campaign error: ${error.message}`);
    res.status(404).json({
      success: false,
      message: error.message,
      error_code: 'CAMPAIGN_NOT_FOUND',
    });
  }
};

exports.getAllCampaigns = async (req, res) => {
  try {
    const { status, campaign_type } = req.query;
    const campaigns = await emailCampaignService.getAllCampaigns({ status, campaign_type });

    res.status(200).json({
      success: true,
      data: campaigns,
      count: campaigns.length,
    });
  } catch (error) {
    logger.error(`Get campaigns error: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message,
      error_code: 'GET_CAMPAIGNS_FAILED',
    });
  }
};

exports.updateCampaign = async (req, res) => {
  try {
    const campaign = await emailCampaignService.updateCampaign(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Email campaign updated successfully',
      data: campaign,
    });
  } catch (error) {
    logger.error(`Update campaign error: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message,
      error_code: 'UPDATE_CAMPAIGN_FAILED',
    });
  }
};

exports.scheduleCampaign = async (req, res) => {
  try {
    const { scheduled_at } = req.body;

    const campaign = await emailCampaignService.scheduleCampaign(req.params.id, scheduled_at);

    res.status(200).json({
      success: true,
      message: 'Email campaign scheduled successfully',
      data: campaign,
    });
  } catch (error) {
    logger.error(`Schedule campaign error: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message,
      error_code: 'SCHEDULE_CAMPAIGN_FAILED',
    });
  }
};

exports.sendCampaign = async (req, res) => {
  try {
    const { subscriber_filters } = req.body;

    const result = await emailCampaignService.sendCampaign(req.params.id, subscriber_filters);

    res.status(200).json({
      success: true,
      message: 'Email campaign sent successfully',
      data: result,
    });
  } catch (error) {
    logger.error(`Send campaign error: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message,
      error_code: 'SEND_CAMPAIGN_FAILED',
    });
  }
};

exports.getCampaignStats = async (req, res) => {
  try {
    const stats = await emailCampaignService.getCampaignStats(req.params.id);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error(`Get campaign stats error: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message,
      error_code: 'GET_CAMPAIGN_STATS_FAILED',
    });
  }
};

exports.deleteCampaign = async (req, res) => {
  try {
    await emailCampaignService.deleteCampaign(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Email campaign deleted successfully',
    });
  } catch (error) {
    logger.error(`Delete campaign error: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message,
      error_code: 'DELETE_CAMPAIGN_FAILED',
    });
  }
};

/**
 * EMAIL SEQUENCE ENDPOINTS
 */

exports.createSequence = async (req, res) => {
  try {
    const { name, description, sequence_type, trigger_event, entry_criteria, exit_criteria, max_recipients_per_day } = req.body;

    const sequence = await emailSequenceService.createSequence({
      name,
      description,
      sequence_type,
      trigger_event,
      entry_criteria,
      exit_criteria,
      max_recipients_per_day,
    }, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Email sequence created successfully',
      data: sequence,
    });
  } catch (error) {
    logger.error(`Create sequence error: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message,
      error_code: 'CREATE_SEQUENCE_FAILED',
    });
  }
};

exports.getSequence = async (req, res) => {
  try {
    const sequence = await emailSequenceService.getSequence(req.params.id);

    res.status(200).json({
      success: true,
      data: sequence,
    });
  } catch (error) {
    logger.error(`Get sequence error: ${error.message}`);
    res.status(404).json({
      success: false,
      message: error.message,
      error_code: 'SEQUENCE_NOT_FOUND',
    });
  }
};

exports.getAllSequences = async (req, res) => {
  try {
    const { status, sequence_type } = req.query;
    const sequences = await emailSequenceService.getAllSequences({ status, sequence_type });

    res.status(200).json({
      success: true,
      data: sequences,
      count: sequences.length,
    });
  } catch (error) {
    logger.error(`Get sequences error: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message,
      error_code: 'GET_SEQUENCES_FAILED',
    });
  }
};

exports.addSequenceStep = async (req, res) => {
  try {
    const { template_id, step_number, delay_value, delay_unit, subject_override, conditions } = req.body;

    const step = await emailSequenceService.addStep(req.params.id, {
      template_id,
      step_number,
      delay_value,
      delay_unit,
      subject_override,
      conditions,
    });

    res.status(201).json({
      success: true,
      message: 'Email sequence step added successfully',
      data: step,
    });
  } catch (error) {
    logger.error(`Add sequence step error: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message,
      error_code: 'ADD_SEQUENCE_STEP_FAILED',
    });
  }
};

exports.getSequenceMetrics = async (req, res) => {
  try {
    const metrics = await emailAutomationService.getSequenceMetrics(req.params.id);

    res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    logger.error(`Get sequence metrics error: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message,
      error_code: 'GET_SEQUENCE_METRICS_FAILED',
    });
  }
};

/**
 * EMAIL ANALYTICS ENDPOINTS
 */

exports.getCampaignAnalytics = async (req, res) => {
  try {
    const analytics = await emailAnalyticsService.getCampaignAnalytics(req.params.id);

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    logger.error(`Get campaign analytics error: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message,
      error_code: 'GET_CAMPAIGN_ANALYTICS_FAILED',
    });
  }
};

exports.getSubscriberEngagement = async (req, res) => {
  try {
    const engagement = await emailAnalyticsService.getSubscriberEngagement(req.params.id);

    res.status(200).json({
      success: true,
      data: engagement,
    });
  } catch (error) {
    logger.error(`Get subscriber engagement error: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message,
      error_code: 'GET_SUBSCRIBER_ENGAGEMENT_FAILED',
    });
  }
};

exports.getTopCampaigns = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const campaigns = await emailAnalyticsService.getTopPerformingCampaigns(limit);

    res.status(200).json({
      success: true,
      data: campaigns,
      count: campaigns.length,
    });
  } catch (error) {
    logger.error(`Get top campaigns error: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message,
      error_code: 'GET_TOP_CAMPAIGNS_FAILED',
    });
  }
};
