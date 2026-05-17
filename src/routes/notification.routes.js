import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as notificationController from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/', authenticate, notificationController.getNotifications);
router.get('/:notificationId', authenticate, notificationController.getNotification);
router.put('/:notificationId/read', authenticate, notificationController.markAsRead);
router.put('/read-all', authenticate, notificationController.markAllAsRead);
router.delete('/:notificationId', authenticate, notificationController.deleteNotification);
router.delete('/', authenticate, notificationController.deleteAllNotifications);
router.post('/bulk', authenticate, notificationController.sendBulkNotifications);

export default router;
