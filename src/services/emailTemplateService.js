const { EmailTemplate } = require('../models');
const logger = require('../config/logger');

/**
 * Create email template
 */
const createTemplate = async (data, userId) => {
  try {
    // Generate slug from name
    const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const template = await EmailTemplate.create({
      name: data.name,
      slug: slug,
      description: data.description,
      subject_line: data.subject_line,
      html_content: data.html_content,
      plain_text_content: data.plain_text_content,
      variables: data.variables || [],
      category: data.category,
      is_active: data.is_active !== false,
      created_by: userId,
    });

    logger.info(`Email template created: ${template.id}`);
    return template;
  } catch (error) {
    logger.error('Create template error:', error);
    throw error;
  }
};

/**
 * Get template by ID
 */
const getTemplate = async (templateId) => {
  try {
    const template = await EmailTemplate.findByPk(templateId);
    if (!template) {
      throw new Error('Template not found');
    }
    return template;
  } catch (error) {
    logger.error('Get template error:', error);
    throw error;
  }
};

/**
 * Get template by slug
 */
const getTemplateBySlug = async (slug) => {
  try {
    const template = await EmailTemplate.findOne({
      where: { slug, is_active: true },
    });
    if (!template) {
      throw new Error('Template not found');
    }
    return template;
  } catch (error) {
    logger.error('Get template by slug error:', error);
    throw error;
  }
};

/**
 * Get all templates
 */
const getAllTemplates = async (filters = {}) => {
  try {
    const where = { is_active: true };
    if (filters.category) where.category = filters.category;

    const templates = await EmailTemplate.findAll({
      where,
      order: [['created_at', 'DESC']],
    });

    return templates;
  } catch (error) {
    logger.error('Get all templates error:', error);
    throw error;
  }
};

/**
 * Update template
 */
const updateTemplate = async (templateId, data) => {
  try {
    const template = await EmailTemplate.findByPk(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    await template.update(data);
    logger.info(`Email template updated: ${templateId}`);
    return template;
  } catch (error) {
    logger.error('Update template error:', error);
    throw error;
  }
};

/**
 * Delete template
 */
const deleteTemplate = async (templateId) => {
  try {
    const template = await EmailTemplate.findByPk(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    await template.destroy();
    logger.info(`Email template deleted: ${templateId}`);
    return true;
  } catch (error) {
    logger.error('Delete template error:', error);
    throw error;
  }
};

/**
 * Render template with variables
 */
const renderTemplate = (template, variables = {}) => {
  let htmlContent = template.html_content;
  let subject = template.subject_line;

  // Replace variables with {{variable}} syntax
  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    htmlContent = htmlContent.replace(regex, variables[key]);
    subject = subject.replace(regex, variables[key]);
  });

  return {
    subject,
    html: htmlContent,
    text: template.plain_text_content,
  };
};

module.exports = {
  createTemplate,
  getTemplate,
  getTemplateBySlug,
  getAllTemplates,
  updateTemplate,
  deleteTemplate,
  renderTemplate,
};
