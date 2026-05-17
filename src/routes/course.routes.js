import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as courseController from '../controllers/course.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/courses:
 *   post:
 *     tags: [Courses]
 *     summary: Create a new course
 *     security: [{bearerAuth: []}]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               instructor: { type: string }
 *               category: { type: string }
 *               duration: { type: number }
 *               image: { type: string }
 *     responses:
 *       201: { description: Course created }
 *       400: { description: Validation error }
 */
router.post('/', authenticate, courseController.createCourse);

/**
 * @swagger
 * /api/v1/courses:
 *   get:
 *     tags: [Courses]
 *     summary: Get all courses
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: sort
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: number }
 *       - in: query
 *         name: limit
 *         schema: { type: number }
 */
router.get('/', courseController.getAllCourses);

/**
 * @swagger
 * /api/v1/courses/{courseId}:
 *   get:
 *     tags: [Courses]
 *     summary: Get a course by ID
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: string }
 */
router.get('/:courseId', courseController.getCourse);

/**
 * @swagger
 * /api/v1/courses/{courseId}:
 *   put:
 *     tags: [Courses]
 *     summary: Update a course
 *     security: [{bearerAuth: []}]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: string }
 */
router.put('/:courseId', authenticate, courseController.updateCourse);

/**
 * @swagger
 * /api/v1/courses/{courseId}:
 *   delete:
 *     tags: [Courses]
 *     summary: Delete a course
 *     security: [{bearerAuth: []}]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: string }
 */
router.delete('/:courseId', authenticate, courseController.deleteCourse);

/**
 * @swagger
 * /api/v1/courses/{courseId}/enroll:
 *   post:
 *     tags: [Courses]
 *     summary: Enroll in a course
 *     security: [{bearerAuth: []}]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: string }
 */
router.post('/:courseId/enroll', authenticate, courseController.enrollCourse);

/**
 * @swagger
 * /api/v1/courses/enrolled/my-courses:
 *   get:
 *     tags: [Courses]
 *     summary: Get user's enrolled courses
 *     security: [{bearerAuth: []}]
 */
router.get('/enrolled/my-courses', authenticate, courseController.getEnrolledCourses);

export default router;
