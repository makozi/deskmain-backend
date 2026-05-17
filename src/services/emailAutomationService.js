const { EmailSequence, EmailSequenceSteps, EmailSequenceSubscribers, EmailSubscriber, EmailTemplate, EmailLog } = require('../models');
const emailService = require('./emailService');
const emailTemplateService = require('./emailTemplateService');
const logger = require('../config/logger');

class EmailAutomationService {
  /**
   * Process pending emails in sequences
   */
  async processPendingEmails() {
    try {
      const now = new Date();

      // Get active sequences
      const activeSequences = await EmailSequence.findAll({
        where: { status: 'active' },
      });

      for (const sequence of activeSequences) {
        await this.processSequence(sequence, now);
      }

      logger.info('Completed processing pending emails');
    } catch (error) {
      logger.error(`Failed to process pending emails: ${error.message}`);
    }
  }

  /**
   * Process a single sequence
   */
  async processSequence(sequence, currentTime) {
    try {
      // Get active subscribers in this sequence
      const activeSubscribers = await EmailSequenceSubscribers.findAll({
        where: {
          sequence_id: sequence.id,
          status: ['entered', 'active'],
        },
        include: [{ model: EmailSubscriber }],
      });

      for (const enrollment of activeSubscribers) {
        await this.processSubscriberInSequence(sequence, enrollment, currentTime);
      }
    } catch (error) {
      logger.error(`Failed to process sequence ${sequence.id}: ${error.message}`);
    }
  }

  /**
   * Process a subscriber in a sequence
   */
  async processSubscriberInSequence(sequence, enrollment, currentTime) {
    try {
      // Get the next step
      const nextStep = await EmailSequenceSteps.findOne({
        where: {
          sequence_id: sequence.id,
          step_number: enrollment.current_step + 1,
          is_active: true,
        },
        include: [{ model: EmailTemplate }],
      });

      if (!nextStep) {
        // No more steps, complete the sequence
        await enrollment.update({ status: 'completed', completed_at: currentTime });
        return;
      }

      // Calculate when to send based on delay
      const lastSent = enrollment.last_step_sent_at || enrollment.enrolled_at;
      const delayMs = this.calculateDelayMs(nextStep.delay_value, nextStep.delay_unit);
      const scheduledTime = new Date(lastSent.getTime() + delayMs);

      if (scheduledTime > currentTime) {
        // Not time to send yet
        return;
      }

      // Check conditions if any
      if (nextStep.conditions && Object.keys(nextStep.conditions).length > 0) {
        const conditionsMet = await this.checkConditions(enrollment.EmailSubscriber, nextStep.conditions);
        if (!conditionsMet) {
          // Exit sequence if conditions not met
          await enrollment.update({ status: 'exited' });
          return;
        }
      }

      // Send the email
      const template = nextStep.EmailTemplate;
      const subject = nextStep.subject_override || template.subject_line;

      await emailService.sendTemplateEmail({
        to: enrollment.EmailSubscriber.email,
        subject: subject,
        html_content: template.html_content,
        plain_text_content: template.plain_text_content,
        template_id: template.id,
      });

      // Update enrollment
      await enrollment.update({
        current_step: nextStep.step_number,
        status: 'active',
        last_step_sent_at: currentTime,
      });

      logger.info(`Email sent in sequence for subscriber ${enrollment.subscriber_id}`);
    } catch (error) {
      logger.error(`Failed to process subscriber in sequence: ${error.message}`);
    }
  }

  /**
   * Trigger sequence on event
   */
  async triggerSequenceOnEvent(eventType, data) {
    try {
      // Find sequences triggered by this event
      const sequences = await EmailSequence.findAll({
        where: {
          trigger_event: eventType,
          status: 'active',
        },
      });

      for (const sequence of sequences) {
        // Check entry criteria
        const criteriaMet = await this.checkEntryConditions(sequence.entry_criteria, data);

        if (criteriaMet && data.subscriber_id) {
          // Enroll subscriber if not already enrolled
          const existing = await EmailSequenceSubscribers.findOne({
            where: {
              sequence_id: sequence.id,
              subscriber_id: data.subscriber_id,
            },
          });

          if (!existing) {
            await EmailSequenceSubscribers.create({
              sequence_id: sequence.id,
              subscriber_id: data.subscriber_id,
              current_step: 0,
              status: 'entered',
            });

            logger.info(`Subscriber enrolled in triggered sequence: ${sequence.id}`);
          }
        }
      }
    } catch (error) {
      logger.error(`Failed to trigger sequence: ${error.message}`);
    }
  }

  /**
   * Calculate delay in milliseconds
   */
  calculateDelayMs(value, unit) {
    const unitMultipliers = {
      minutes: 60 * 1000,
      hours: 60 * 60 * 1000,
      days: 24 * 60 * 60 * 1000,
    };

    return value * (unitMultipliers[unit] || unitMultipliers.days);
  }

  /**
   * Check entry conditions for a sequence
   */
  async checkEntryConditions(conditions, data) {
    // Implement custom logic based on your entry criteria
    if (!conditions || Object.keys(conditions).length === 0) {
      return true;
    }

    // Example condition checks
    if (conditions.min_purchase_amount && data.order_amount < conditions.min_purchase_amount) {
      return false;
    }

    if (conditions.product_category && data.product_category !== conditions.product_category) {
      return false;
    }

    return true;
  }

  /**
   * Check exit conditions for a sequence
   */
  async checkConditions(subscriber, conditions) {
    // Implement custom logic based on subscriber data
    if (!conditions || Object.keys(conditions).length === 0) {
      return true;
    }

    // Example condition checks
    if (conditions.must_be_active && subscriber.status !== 'subscribed') {
      return false;
    }

    if (conditions.bounce_count_max && subscriber.bounce_count >= conditions.bounce_count_max) {
      return false;
    }

    return true;
  }

  /**
   * Get sequence performance metrics
   */
  async getSequenceMetrics(sequenceId) {
    try {
      const enrollments = await EmailSequenceSubscribers.findAll({
        where: { sequence_id: sequenceId },
      });

      const totalEnrolled = enrollments.length;
      const completed = enrollments.filter(e => e.status === 'completed').length;
      const active = enrollments.filter(e => e.status === 'active').length;
      const exited = enrollments.filter(e => e.status === 'exited').length;

      return {
        total_enrolled: totalEnrolled,
        completed: completed,
        completion_rate: totalEnrolled > 0 ? (completed / totalEnrolled * 100).toFixed(2) : 0,
        active: active,
        exited: exited,
      };
    } catch (error) {
      logger.error(`Failed to get sequence metrics: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new EmailAutomationService();
