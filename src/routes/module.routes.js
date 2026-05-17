import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as moduleController from '../controllers/module.controller.js';

const router = express.Router();

router.post('/courses/:courseId/modules', authenticate, moduleController.createModule);
router.get('/modules/:moduleId', moduleController.getModule);
router.get('/courses/:courseId/modules', moduleController.getCourseModules);
router.put('/modules/:moduleId', authenticate, moduleController.updateModule);
router.delete('/modules/:moduleId', authenticate, moduleController.deleteModule);

export default router;
