const { EmailLog, EmailCampaign, EmailCampaignSubscribers, EmailAnalytics, EmailSequence, EmailSequenceSubscribers } = require('../models');
const logger = require('../config/logger');

class EmailAnalyticsService {
  /**
   * Record an email event
   */
  async recordEvent(eventData) {
    try {
      const log = await EmailLog.create({
        campaign_id: eventData.campaign_id,
        campaign_subscriber_id: eventData.campaign_subscriber_id,
        subscriber_id: eventData.subscriber_id,
        recipient_email: eventData.recipient_email,
        message_id: eventData.message_id,
        status: eventData.status,
        event_type: eventData.event_type,
        event_data: eventData.event_data || {},
        error_message: eventData.error_message,
        sendgrid_response: eventData.sendgrid_response,
      });

      logger.info(`Email event recorded: ${log.id}`);
      return log;
    } catch (error) {
      logger.error(`Failed to record email event: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get campaign analytics
   */
  async getCampaignAnalytics(campaignId) {
    try {
      const campaign = await EmailCampaign.findByPk(campaignId);

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const logs = await EmailLog.findAll({
        where: { campaign_id: campaignId },
      });

      // Calculate metrics
      const sentCount = logs.filter(l => l.event_type === 'send').length;
      const deliveredCount = logs.filter(l => l.event_type === 'delivery' && l.status === 'delivered').length;
      const openCount = logs.filter(l => l.event_type === 'open').length;
      const clickCount = logs.filter(l => l.event_type === 'click').length;
      const bounceCount = logs.filter(l => l.event_type === 'bounce').length;
      const complaintCount = logs.filter(l => l.event_type === 'complaint').length;
      const unsubscribeCount = logs.filter(l => l.event_type === 'unsubscribe').length;

      const openRate = sentCount > 0 ? (openCount / sentCount * 100).toFixed(2) : 0;
      const clickRate = sentCount > 0 ? (clickCount / sentCount * 100).toFixed(2) : 0;
      const deliveryRate = sentCount > 0 ? (deliveredCount / sentCount * 100).toFixed(2) : 0;
      const bounceRate = sentCount > 0 ? (bounceCount / sentCount * 100).toFixed(2) : 0;

      return {
        campaign_id: campaignId,
        campaign_name: campaign.name,
        sent: sentCount,
        delivered: deliveredCount,
        delivery_rate: deliveryRate,
        opens: openCount,
        open_rate: openRate,
        clicks: clickCount,
        click_rate: clickRate,
        bounces: bounceCount,
        bounce_rate: bounceRate,
        complaints: complaintCount,
        unsubscribes: unsubscribeCount,
        total_recipients: campaign.total_recipients,
      };
    } catch (error) {
      logger.error(`Failed to get campaign analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get subscriber engagement history
   */
  async getSubscriberEngagement(subscriberId) {
    try {
      const logs = await EmailLog.findAll({
        where: { subscriber_id: subscriberId },
        include: [{ model: EmailCampaign, as: 'campaign' }],
        order: [['created_at', 'DESC']],
        limit: 100,
      });

      // Calculate engagement score
      const opens = logs.filter(l => l.event_type === 'open').length;
      const clicks = logs.filter(l => l.event_type === 'click').length;
      const bounces = logs.filter(l => l.event_type === 'bounce').length;
      const complaints = logs.filter(l => l.event_type === 'complaint').length;
      const unsubscribes = logs.filter(l => l.event_type === 'unsubscribe').length;

      const engagementScore = Math.max(0, (opens * 1 + clicks * 2 - bounces * 5 - complaints * 10 - unsubscribes * 20));

      return {
        subscriber_id: subscriberId,
        total_emails_received: logs.filter(l => l.event_type === 'send').length,
        opens: opens,
        clicks: clicks,
        bounces: bounces,
        complaints: complaints,
        unsubscribes: unsubscribes,
        engagement_score: engagementScore,
        engagement_level: this.getEngagementLevel(engagementScore),
        recent_activity: logs.slice(0, 20),
      };
    } catch (error) {
      logger.error(`Failed to get subscriber engagement: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get daily analytics
   */
  async getDailyAnalytics(campaignId, dateRange = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      const dailyMetrics = await EmailLog.findAll({
        attributes: [
          ['DATE(created_at)', 'date'],
          ['COUNT(*)', 'total'],
        ],
        where: {
          campaign_id: campaignId,
          created_at: { $gte: startDate },
        },
        group: ['DATE(created_at)'],
        order: [['DATE(created_at)', 'ASC']],
        raw: true,
      });

      return dailyMetrics;
    } catch (error) {
      logger.error(`Failed to get daily analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get top performing content
   */
  async getTopPerformingCampaigns(limit = 10) {
    try {
      const campaigns = await EmailCampaign.findAll({
        order: [['opened_count', 'DESC']],
        limit: limit,
      });

      const performanceData = campaigns.map(campaign => ({
        campaign_id: campaign.id,
        campaign_name: campaign.name,
        sent: campaign.sent_count,
        delivered: campaign.delivered_count,
        opens: campaign.opened_count,
        clicks: campaign.clicked_count,
        open_rate: campaign.sent_count > 0 ? (campaign.opened_count / campaign.sent_count * 100).toFixed(2) : 0,
        click_rate: campaign.sent_count > 0 ? (campaign.clicked_count / campaign.sent_count * 100).toFixed(2) : 0,
      }));

      return performanceData;
    } catch (error) {
      logger.error(`Failed to get top performing campaigns: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get subscriber segmentation analytics
   */
  async getSegmentationAnalytics() {
    try {
      const totalSubscribers = await EmailLog.count({ distinct: true, col: 'subscriber_id' });
      const activeSubscribers = await EmailLog.count({
        distinct: true,
        col: 'subscriber_id',
        where: {
          created_at: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      });

      return {
        total_subscribers: totalSubscribers,
        active_subscribers: activeSubscribers,
        inactive_subscribers: totalSubscribers - activeSubscribers,
        engagement_breakdown: {
          highly_engaged: await this.countSubscribersByEngagement('high'),
          moderately_engaged: await this.countSubscribersByEngagement('medium'),
          low_engagement: await this.countSubscribersByEngagement('low'),
        },
      };
    } catch (error) {
      logger.error(`Failed to get segmentation analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Count subscribers by engagement level
   */
  async countSubscribersByEngagement(level) {
    // Implement logic to categorize subscribers by engagement
    return 0; // Placeholder
  }

  /**
   * Get engagement level description
   */
  getEngagementLevel(score) {
    if (score >= 50) return 'Highly Engaged';
    if (score >= 20) return 'Moderately Engaged';
    if (score >= 0) return 'Low Engagement';
    return 'At Risk';
  }

  /**
   * Store aggregated analytics
   */
  async storeAnalyticsSnapshot(campaignId) {
    try {
      const analytics = await this.getCampaignAnalytics(campaignId);

      await EmailAnalytics.create({
        campaign_id: campaignId,
        date_tracked: new Date(),
        total_sent: analytics.sent,
        total_delivered: analytics.delivered,
        total_opened: analytics.opens,
        total_clicked: analytics.clicks,
        total_bounced: analytics.bounces,
        total_complained: analytics.complaints,
        total_unsubscribed: analytics.unsubscribes,
        open_rate: analytics.open_rate,
        click_rate: analytics.click_rate,
        bounce_rate: analytics.bounce_rate,
      });

      logger.info(`Analytics snapshot stored for campaign: ${campaignId}`);
    } catch (error) {
      logger.error(`Failed to store analytics snapshot: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get historical analytics
   */
  async getHistoricalAnalytics(campaignId) {
    try {
      const historical = await EmailAnalytics.findAll({
        where: { campaign_id: campaignId },
        order: [['date_tracked', 'DESC']],
      });

      return historical;
    } catch (error) {
      logger.error(`Failed to get historical analytics: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new EmailAnalyticsService();
