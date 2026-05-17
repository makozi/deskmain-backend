import db from '../config/database.js';
import logger from '../config/logger.js';

export const createModule = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, sequence } = req.body;

    const result = await db.query(
      `INSERT INTO course_modules (course_id, title, description, sequence, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [courseId, title, description, sequence]
    );

    logger.info(`Module created: ${result.rows[0].id}`);
    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error creating module:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getModule = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const result = await db.query(
      'SELECT * FROM course_modules WHERE id = $1',
      [moduleId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Get lessons for this module
    const lessonsResult = await db.query(
      'SELECT * FROM course_lessons WHERE module_id = $1 ORDER BY sequence',
      [moduleId]
    );

    const module = result.rows[0];
    module.lessons = lessonsResult.rows;

    res.json({
      success: true,
      data: module
    });
  } catch (error) {
    logger.error('Error fetching module:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getCourseModules = async (req, res) => {
  try {
    const { courseId } = req.params;

    const result = await db.query(
      'SELECT * FROM course_modules WHERE course_id = $1 ORDER BY sequence',
      [courseId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching modules:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const updateModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { title, description, sequence } = req.body;

    const result = await db.query(
      `UPDATE course_modules SET title = $1, description = $2, sequence = $3, updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [title, description, sequence, moduleId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    logger.info(`Module updated: ${moduleId}`);
    res.json({
      success: true,
      message: 'Module updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error updating module:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteModule = async (req, res) => {
  try {
    const { moduleId } = req.params;

    // Delete lessons first
    await db.query('DELETE FROM course_lessons WHERE module_id = $1', [moduleId]);

    const result = await db.query(
      'DELETE FROM course_modules WHERE id = $1 RETURNING *',
      [moduleId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    logger.info(`Module deleted: ${moduleId}`);
    res.json({
      success: true,
      message: 'Module deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting module:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
