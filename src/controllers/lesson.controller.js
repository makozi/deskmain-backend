import db from '../config/database.js';
import logger from '../config/logger.js';

export const createLesson = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { title, description, content, videoUrl, duration, sequence } = req.body;

    const result = await db.query(
      `INSERT INTO course_lessons (module_id, title, description, content, video_url, duration, sequence, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [moduleId, title, description, content, videoUrl, duration, sequence]
    );

    logger.info(`Lesson created: ${result.rows[0].id}`);
    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error creating lesson:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user?.id;

    const result = await db.query(
      'SELECT * FROM course_lessons WHERE id = $1',
      [lessonId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    const lesson = result.rows[0];

    // Get user progress on this lesson
    if (userId) {
      const progressResult = await db.query(
        `SELECT * FROM lesson_progress WHERE user_id = $1 AND lesson_id = $2`,
        [userId, lessonId]
      );
      lesson.userProgress = progressResult.rows[0] || null;
    }

    res.json({
      success: true,
      data: lesson
    });
  } catch (error) {
    logger.error('Error fetching lesson:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getModuleLessons = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const result = await db.query(
      'SELECT * FROM course_lessons WHERE module_id = $1 ORDER BY sequence',
      [moduleId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching lessons:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, description, content, videoUrl, duration, sequence } = req.body;

    const result = await db.query(
      `UPDATE course_lessons SET title = $1, description = $2, content = $3,
       video_url = $4, duration = $5, sequence = $6, updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [title, description, content, videoUrl, duration, sequence, lessonId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    logger.info(`Lesson updated: ${lessonId}`);
    res.json({
      success: true,
      message: 'Lesson updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error updating lesson:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    // Delete lesson progress
    await db.query('DELETE FROM lesson_progress WHERE lesson_id = $1', [lessonId]);

    const result = await db.query(
      'DELETE FROM course_lessons WHERE id = $1 RETURNING *',
      [lessonId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    logger.info(`Lesson deleted: ${lessonId}`);
    res.json({
      success: true,
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting lesson:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const markLessonComplete = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      `INSERT INTO lesson_progress (user_id, lesson_id, completed_at, status)
       VALUES ($1, $2, NOW(), 'completed')
       ON CONFLICT (user_id, lesson_id) DO UPDATE SET completed_at = NOW(), status = 'completed'
       RETURNING *`,
      [userId, lessonId]
    );

    logger.info(`User ${userId} completed lesson ${lessonId}`);
    res.json({
      success: true,
      message: 'Lesson marked as complete',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error marking lesson complete:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
