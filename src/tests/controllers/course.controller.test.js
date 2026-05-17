import * as courseController from '../../controllers/course.controller.js';
import db from '../../config/database.js';
import logger from '../../config/logger.js';

jest.mock('../../config/database.js');
jest.mock('../../config/logger.js');

describe('Course Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: 'user-1' },
      params: {},
      body: {},
      query: {}
    };

    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };

    jest.clearAllMocks();
  });

  describe('createCourse', () => {
    it('should create a new course successfully', async () => {
      req.body = {
        title: 'Python 101',
        description: 'Learn Python basics',
        price: 49.99,
        instructor: 'Jane Smith',
        category: 'programming',
        duration: 8
      };

      const mockCourse = {
        id: 'course-1',
        ...req.body,
        created_at: new Date()
      };

      db.query.mockResolvedValueOnce({ rows: [mockCourse] });

      await courseController.createCourse(req, res);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO courses'),
        expect.any(Array)
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      req.body = { title: 'Course' };
      const error = new Error('Database error');

      db.query.mockRejectedValueOnce(error);

      await courseController.createCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: error.message
      });
    });
  });

  describe('getAllCourses', () => {
    it('should retrieve all courses with pagination', async () => {
      req.query = { page: 1, limit: 20, category: 'programming' };

      const mockCourses = [
        { id: 'course-1', title: 'Python 101' },
        { id: 'course-2', title: 'JavaScript 101' }
      ];

      db.query.mockResolvedValueOnce({ rows: mockCourses })
              .mockResolvedValueOnce({ rows: [{ count: 2 }] });

      await courseController.getAllCourses(req, res);

      expect(db.query).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Array),
        pagination: expect.any(Object)
      });
    });
  });

  describe('getCourse', () => {
    it('should retrieve a course by ID', async () => {
      req.params = { courseId: 'course-1' };

      const mockCourse = {
        id: 'course-1',
        title: 'Python 101',
        description: 'Learn Python basics'
      };

      db.query.mockResolvedValueOnce({ rows: [mockCourse] });

      await courseController.getCourse(req, res);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM courses'),
        ['course-1']
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCourse
      });
    });

    it('should return 404 if course not found', async () => {
      req.params = { courseId: 'non-existent' };

      db.query.mockResolvedValueOnce({ rows: [] });

      await courseController.getCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('updateCourse', () => {
    it('should update a course', async () => {
      req.params = { courseId: 'course-1' };
      req.body = { title: 'Advanced Python' };

      const updatedCourse = {
        id: 'course-1',
        title: 'Advanced Python',
        updated_at: new Date()
      };

      db.query.mockResolvedValueOnce({ rows: [updatedCourse] });

      await courseController.updateCourse(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Course updated successfully',
        data: updatedCourse
      });
    });
  });

  describe('deleteCourse', () => {
    it('should delete a course', async () => {
      req.params = { courseId: 'course-1' };

      db.query.mockResolvedValueOnce({ rows: [{ id: 'course-1' }] });

      await courseController.deleteCourse(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Course deleted successfully'
      });
    });
  });

  describe('enrollCourse', () => {
    it('should enroll user in a course', async () => {
      req.params = { courseId: 'course-1' };

      db.query.mockResolvedValueOnce({ rows: [{ id: 'course-1' }] })
              .mockResolvedValueOnce({ rows: [{ id: 'enrollment-1' }] });

      await courseController.enrollCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });

    it('should return 404 if course not found', async () => {
      req.params = { courseId: 'non-existent' };

      db.query.mockResolvedValueOnce({ rows: [] });

      await courseController.enrollCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('getEnrolledCourses', () => {
    it('should retrieve user enrolled courses', async () => {
      const enrolledCourses = [
        { id: 'course-1', title: 'Python 101', progress: 50 }
      ];

      db.query.mockResolvedValueOnce({ rows: enrolledCourses });

      await courseController.getEnrolledCourses(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: enrolledCourses
      });
    });
  });
});
