import request from 'supertest';
import express from 'express';
import courseRoutes from '../../routes/course.routes.js';
import * as courseController from '../../controllers/course.controller.js';
import { authenticate } from '../../middleware/auth.js';

jest.mock('../../controllers/course.controller.js');
jest.mock('../../middleware/auth.js');

describe('Course Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Mock authenticate middleware
    authenticate.mockImplementation((req, res, next) => {
      req.user = { id: 'user-1', role: 'user' };
      next();
    });

    app.use('/api/v1/courses', courseRoutes);

    jest.clearAllMocks();
  });

  describe('GET /api/v1/courses', () => {
    it('should return all courses', async () => {
      const mockCourses = [
        { id: 'course-1', title: 'Python 101' },
        { id: 'course-2', title: 'JavaScript 101' }
      ];

      courseController.getAllCourses.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockCourses,
          pagination: { page: 1, limit: 20, total: 2 }
        });
      });

      const response = await request(app)
        .get('/api/v1/courses')
        .query({ page: 1, limit: 20 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should support category filtering', async () => {
      courseController.getAllCourses.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: [],
          pagination: { page: 1, limit: 20, total: 0 }
        });
      });

      const response = await request(app)
        .get('/api/v1/courses')
        .query({ category: 'programming' });

      expect(response.status).toBe(200);
      expect(courseController.getAllCourses).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/courses/:courseId', () => {
    it('should return a specific course', async () => {
      const mockCourse = {
        id: 'course-1',
        title: 'Python 101',
        description: 'Learn Python basics'
      };

      courseController.getCourse.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockCourse
        });
      });

      const response = await request(app)
        .get('/api/v1/courses/course-1');

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe('course-1');
    });
  });

  describe('POST /api/v1/courses', () => {
    it('should create a new course (authenticated)', async () => {
      const courseData = {
        title: 'New Course',
        description: 'Course description',
        price: 49.99,
        instructor: 'John Doe',
        category: 'programming',
        duration: 8
      };

      courseController.createCourse.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          message: 'Course created',
          data: { id: 'course-new', ...courseData }
        });
      });

      const response = await request(app)
        .post('/api/v1/courses')
        .send(courseData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(authenticate).toHaveBeenCalled();
    });

    it('should return 401 if not authenticated', async () => {
      authenticate.mockImplementation((req, res, next) => {
        res.status(401).json({ success: false, message: 'Unauthorized' });
      });

      const response = await request(app)
        .post('/api/v1/courses')
        .send({ title: 'Course' });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/v1/courses/:courseId', () => {
    it('should update a course (authenticated)', async () => {
      const updateData = { title: 'Updated Course' };

      courseController.updateCourse.mockImplementation((req, res) => {
        res.json({
          success: true,
          message: 'Course updated successfully',
          data: { id: 'course-1', title: 'Updated Course' }
        });
      });

      const response = await request(app)
        .put('/api/v1/courses/course-1')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/v1/courses/:courseId', () => {
    it('should delete a course (authenticated)', async () => {
      courseController.deleteCourse.mockImplementation((req, res) => {
        res.json({
          success: true,
          message: 'Course deleted successfully'
        });
      });

      const response = await request(app)
        .delete('/api/v1/courses/course-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/courses/:courseId/enroll', () => {
    it('should enroll user in course (authenticated)', async () => {
      courseController.enrollCourse.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          message: 'Enrolled successfully'
        });
      });

      const response = await request(app)
        .post('/api/v1/courses/course-1/enroll');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/courses/enrolled/my-courses', () => {
    it('should return user enrolled courses', async () => {
      const enrolledCourses = [
        { id: 'course-1', title: 'Python 101', progress: 50 }
      ];

      courseController.getEnrolledCourses.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: enrolledCourses
        });
      });

      const response = await request(app)
        .get('/api/v1/courses/enrolled/my-courses');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
    });
  });
});
