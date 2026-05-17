import db from '../config/database.js';
import logger from '../config/logger.js';

export const createCourse = async (req, res) => {
  try {
    const { title, description, price, instructor, category, duration, image } = req.body;

    const result = await db.query(
      `INSERT INTO courses (title, description, price, instructor, category, duration, image, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [title, description, price, instructor, category, duration, image]
    );

    logger.info(`Course created: ${result.rows[0].id}`);
    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error creating course:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const result = await db.query(
      'SELECT * FROM courses WHERE id = $1',
      [courseId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error fetching course:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const { category, sort = 'created_at', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM courses';
    const params = [];

    if (category) {
      query += ' WHERE category = $1';
      params.push(category);
    }

    query += ` ORDER BY ${sort} DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    const countResult = await db.query(
      category ? 'SELECT COUNT(*) FROM courses WHERE category = $1' : 'SELECT COUNT(*) FROM courses',
      category ? [category] : []
    );

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching courses:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, price, instructor, category, duration, image } = req.body;

    const result = await db.query(
      `UPDATE courses SET title = $1, description = $2, price = $3, instructor = $4,
       category = $5, duration = $6, image = $7, updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [title, description, price, instructor, category, duration, image, courseId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    logger.info(`Course updated: ${courseId}`);
    res.json({
      success: true,
      message: 'Course updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error updating course:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const result = await db.query(
      'DELETE FROM courses WHERE id = $1 RETURNING *',
      [courseId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    logger.info(`Course deleted: ${courseId}`);
    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting course:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Check if already enrolled
    const checkResult = await db.query(
      'SELECT * FROM course_enrollments WHERE user_id = $1 AND course_id = $2',
      [userId, courseId]
    );

    if (checkResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    const result = await db.query(
      `INSERT INTO course_enrollments (user_id, course_id, enrolled_at)
       VALUES ($1, $2, NOW())
       RETURNING *`,
      [userId, courseId]
    );

    logger.info(`User ${userId} enrolled in course ${courseId}`);
    res.status(201).json({
      success: true,
      message: 'Enrolled successfully',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error enrolling in course:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT c.*, ce.enrolled_at, ce.progress
       FROM courses c
       INNER JOIN course_enrollments ce ON c.id = ce.course_id
       WHERE ce.user_id = $1
       ORDER BY ce.enrolled_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching enrolled courses:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
