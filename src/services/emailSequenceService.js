const { EmailSequence, EmailSequenceSteps, EmailSequenceSubscribers, EmailSubscriber, EmailTemplate } = require('../models');
const logger = require('../config/logger');

class EmailSequenceService {
  /**
   * Create a new email sequence
   */
  async createSequence(data, userId) {
    try {
      const sequence = await EmailSequence.create({
        name: data.name,
        description: data.description,
        sequence_type: data.sequence_type,
        trigger_event: data.trigger_event,
        status: 'active',
        entry_criteria: data.entry_criteria || {},
        exit_criteria: data.exit_criteria || {},
        max_recipients_per_day: data.max_recipients_per_day || 1000,
        created_by: userId,
      });

      logger.info(`Email sequence created: ${sequence.id}`);
      return sequence;
    } catch (error) {
      logger.error(`Failed to create email sequence: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get a sequence by ID
   */
  async getSequence(sequenceId) {
    try {
      const sequence = await EmailSequence.findByPk(sequenceId, {
        include: [{ model: EmailSequenceSteps, as: 'steps' }],
      });

      if (!sequence) {
        throw new Error('Email sequence not found');
      }

      return sequence;
    } catch (error) {
      logger.error(`Failed to get email sequence: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all sequences with filters
   */
  async getAllSequences(filters = {}) {
    try {
      const where = {};

      if (filters.status) {
        where.status = filters.status;
      }
      if (filters.sequence_type) {
        where.sequence_type = filters.sequence_type;
      }

      const sequences = await EmailSequence.findAll({
        where,
        include: [{ model: EmailSequenceSteps, as: 'steps' }],
        order: [['created_at', 'DESC']],
      });

      return sequences;
    } catch (error) {
      logger.error(`Failed to get email sequences: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update a sequence
   */
  async updateSequence(sequenceId, data) {
    try {
      const sequence = await EmailSequence.findByPk(sequenceId);

      if (!sequence) {
        throw new Error('Email sequence not found');
      }

      await sequence.update(data);

      logger.info(`Email sequence updated: ${sequenceId}`);
      return sequence;
    } catch (error) {
      logger.error(`Failed to update email sequence: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add a step to the sequence
   */
  async addStep(sequenceId, stepData) {
    try {
      const sequence = await EmailSequence.findByPk(sequenceId);
      if (!sequence) {
        throw new Error('Email sequence not found');
      }

      const step = await EmailSequenceSteps.create({
        sequence_id: sequenceId,
        template_id: stepData.template_id,
        step_number: stepData.step_number,
        delay_value: stepData.delay_value || 0,
        delay_unit: stepData.delay_unit || 'days',
        subject_override: stepData.subject_override || null,
        conditions: stepData.conditions || {},
        is_active: true,
      });

      logger.info(`Email sequence step added: ${step.id}`);
      return step;
    } catch (error) {
      logger.error(`Failed to add email sequence step: ${error.message}`);
      throw error;
    }
  }

  /**
   * Enroll a subscriber in a sequence
   */
  async enrollSubscriber(sequenceId, subscriberId) {
    try {
      const sequence = await EmailSequence.findByPk(sequenceId);
      if (!sequence) {
        throw new Error('Email sequence not found');
      }

      const subscriber = await EmailSubscriber.findByPk(subscriberId);
      if (!subscriber) {
        throw new Error('Email subscriber not found');
      }

      // Check if already enrolled
      const existing = await EmailSequenceSubscribers.findOne({
        where: { sequence_id: sequenceId, subscriber_id: subscriberId },
      });

      if (existing) {
        return existing;
      }

      const enrollment = await EmailSequenceSubscribers.create({
        sequence_id: sequenceId,
        subscriber_id: subscriberId,
        current_step: 0,
        status: 'entered',
      });

      logger.info(`Subscriber enrolled in sequence: ${sequenceId}`);
      return enrollment;
    } catch (error) {
      logger.error(`Failed to enroll subscriber: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get sequence subscribers
   */
  async getSequenceSubscribers(sequenceId, filters = {}) {
    try {
      const where = { sequence_id: sequenceId };

      if (filters.status) {
        where.status = filters.status;
      }

      const subscribers = await EmailSequenceSubscribers.findAll({
        where,
        include: [{ model: EmailSubscriber }],
        order: [['enrolled_at', 'DESC']],
      });

      return subscribers;
    } catch (error) {
      logger.error(`Failed to get sequence subscribers: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update subscriber step in sequence
   */
  async updateSubscriberStep(sequenceSubscriberId, currentStep, status) {
    try {
      const enrollment = await EmailSequenceSubscribers.findByPk(sequenceSubscriberId);

      if (!enrollment) {
        throw new Error('Sequence enrollment not found');
      }

      await enrollment.update({
        current_step: currentStep,
        status: status,
        last_step_sent_at: new Date(),
      });

      logger.info(`Sequence subscriber step updated: ${sequenceSubscriberId}`);
      return enrollment;
    } catch (error) {
      logger.error(`Failed to update subscriber step: ${error.message}`);
      throw error;
    }
  }

  /**
   * Complete sequence for a subscriber
   */
  async completeSequence(sequenceSubscriberId) {
    try {
      const enrollment = await EmailSequenceSubscribers.findByPk(sequenceSubscriberId);

      if (!enrollment) {
        throw new Error('Sequence enrollment not found');
      }

      await enrollment.update({
        status: 'completed',
        completed_at: new Date(),
      });

      logger.info(`Sequence completed for subscriber: ${sequenceSubscriberId}`);
      return enrollment;
    } catch (error) {
      logger.error(`Failed to complete sequence: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a sequence
   */
  async deleteSequence(sequenceId) {
    try {
      const sequence = await EmailSequence.findByPk(sequenceId);

      if (!sequence) {
        throw new Error('Email sequence not found');
      }

      await sequence.destroy();

      logger.info(`Email sequence deleted: ${sequenceId}`);
      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete email sequence: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new EmailSequenceService();
