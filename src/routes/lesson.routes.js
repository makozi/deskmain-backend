import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as lessonController from '../controllers/lesson.controller.js';

const router = express.Router();

router.post('/modules/:moduleId/lessons', authenticate, lessonController.createLesson);
router.get('/lessons/:lessonId', lessonController.getLesson);
router.get('/modules/:moduleId/lessons', lessonController.getModuleLessons);
router.put('/lessons/:lessonId', authenticate, lessonController.updateLesson);
router.delete('/lessons/:lessonId', authenticate, lessonController.deleteLesson);
router.post('/lessons/:lessonId/complete', authenticate, lessonController.markLessonComplete);

export default router;
