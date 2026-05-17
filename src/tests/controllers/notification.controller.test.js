import * as notificationController from '../../controllers/notification.controller.js';
import db from '../../config/database.js';
import logger from '../../config/logger.js';

jest.mock('../../config/database.js');
jest.mock('../../config/logger.js');

describe('Notification Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: 'user-1', role: 'user' },
      params: {},
      body: {},
      query: { limit: 20 }
    };

    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };

    jest.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('should retrieve user notifications with pagination', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          title: 'Order Confirmed',
          message: 'Your order has been confirmed',
          read: false
        }
      ];

      db.query.mockResolvedValueOnce({ rows: mockNotifications })
              .mockResolvedValueOnce({ rows: [{ unread_count: 5 }] });

      await notificationController.getNotifications(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockNotifications,
        unreadCount: 5
      });
    });
  });

  describe('getNotification', () => {
    it('should retrieve a specific notification', async () => {
      req.params = { notificationId: 'notif-1' };

      const mockNotification = {
        id: 'notif-1',
        title: 'Order Confirmed',
        read: false
      };

      db.query.mockResolvedValueOnce({ rows: [mockNotification] });

      await notificationController.getNotification(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockNotification
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      req.params = { notificationId: 'notif-1' };

      db.query.mockResolvedValueOnce({ rows: [{ id: 'notif-1', read: true }] });

      await notificationController.markAsRead(req, res);

      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      await notificationController.markAllAsRead(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'All notifications marked as read'
      });
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      req.params = { notificationId: 'notif-1' };

      db.query.mockResolvedValueOnce({ rows: [{ id: 'notif-1' }] });

      await notificationController.deleteNotification(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Notification deleted successfully'
      });
    });
  });

  describe('createNotification', () => {
    it('should create a new notification', async () => {
      req.body = {
        userId: 'user-1',
        title: 'New Message',
        message: 'You have a new message',
        type: 'message'
      };

      const mockNotification = {
        id: 'notif-1',
        ...req.body,
        read: false,
        created_at: new Date()
      };

      db.query.mockResolvedValueOnce({ rows: [mockNotification] });

      await notificationController.createNotification(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('sendBulkNotifications', () => {
    it('should send notifications to multiple users', async () => {
      req.user.role = 'admin';
      req.body = {
        userIds: ['user-1', 'user-2'],
        title: 'System Update',
        message: 'System maintenance scheduled',
        type: 'system'
      };

      db.query.mockResolvedValueOnce({ rows: [{ id: 'notif-1' }, { id: 'notif-2' }] });

      await notificationController.sendBulkNotifications(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });
});
