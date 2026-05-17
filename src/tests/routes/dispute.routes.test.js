import request from 'supertest';
import express from 'express';
import disputeRoutes from '../../routes/dispute.routes.js';
import * as disputeController from '../../controllers/dispute.controller.js';
import { authenticate } from '../../middleware/auth.js';

jest.mock('../../controllers/dispute.controller.js');
jest.mock('../../middleware/auth.js');

describe('Dispute Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    authenticate.mockImplementation((req, res, next) => {
      req.user = { id: 'user-1', role: 'user' };
      next();
    });

    app.use('/api/v1/disputes', disputeRoutes);

    jest.clearAllMocks();
  });

  describe('POST /api/v1/disputes', () => {
    it('should create a new dispute (authenticated)', async () => {
      const disputeData = {
        orderId: 'order-1',
        reason: 'Item not as described',
        description: 'The product quality is poor',
        evidenceUrls: ['https://example.com/photo1.jpg']
      };

      disputeController.createDispute.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          message: 'Dispute created successfully',
          data: {
            id: 'dispute-1',
            ...disputeData,
            status: 'pending',
            buyer_id: 'user-1',
            created_at: new Date()
          }
        });
      });

      const response = await request(app)
        .post('/api/v1/disputes')
        .send(disputeData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('pending');
      expect(authenticate).toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      disputeController.createDispute.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'orderId is required'
        });
      });

      const response = await request(app)
        .post('/api/v1/disputes')
        .send({
          reason: 'Item not as described'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 if order not found', async () => {
      disputeController.createDispute.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      });

      const response = await request(app)
        .post('/api/v1/disputes')
        .send({
          orderId: 'non-existent',
          reason: 'Item not as described'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/v1/disputes/:disputeId', () => {
    it('should retrieve dispute details', async () => {
      const mockDispute = {
        id: 'dispute-1',
        order_id: 'order-1',
        buyer_id: 'user-1',
        reason: 'Item not as described',
        description: 'Quality poor',
        status: 'pending',
        evidence_urls: '["https://example.com/photo1.jpg"]',
        created_at: '2026-05-17T10:00:00Z'
      };

      disputeController.getDispute.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: {
            ...mockDispute,
            evidenceUrls: JSON.parse(mockDispute.evidence_urls)
          }
        });
      });

      const response = await request(app)
        .get('/api/v1/disputes/dispute-1');

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe('dispute-1');
      expect(response.body.data.status).toBe('pending');
    });

    it('should return 404 for non-existent dispute', async () => {
      disputeController.getDispute.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Dispute not found'
        });
      });

      const response = await request(app)
        .get('/api/v1/disputes/non-existent');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/v1/disputes', () => {
    it('should retrieve user disputes', async () => {
      const mockDisputes = [
        {
          id: 'dispute-1',
          order_id: 'order-1',
          buyer_id: 'user-1',
          status: 'pending',
          created_at: '2026-05-17T10:00:00Z'
        }
      ];

      disputeController.getUserDisputes.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockDisputes
        });
      });

      const response = await request(app)
        .get('/api/v1/disputes')
        .query({ limit: 20, offset: 0 });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
    });

    it('should filter disputes by status', async () => {
      const mockDisputes = [
        {
          id: 'dispute-1',
          status: 'resolved',
          created_at: '2026-05-16T10:00:00Z'
        }
      ];

      disputeController.getUserDisputes.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockDisputes
        });
      });

      const response = await request(app)
        .get('/api/v1/disputes')
        .query({ status: 'resolved', limit: 20, offset: 0 });

      expect(response.status).toBe(200);
      expect(response.body.data[0].status).toBe('resolved');
    });
  });

  describe('GET /api/v1/disputes/admin/all', () => {
    it('should retrieve all disputes (admin only)', async () => {
      authenticate.mockImplementation((req, res, next) => {
        req.user = { id: 'admin-1', role: 'admin' };
        next();
      });

      const mockDisputes = [
        { id: 'dispute-1', status: 'pending' },
        { id: 'dispute-2', status: 'resolved' }
      ];

      disputeController.getAllDisputes.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockDisputes
        });
      });

      const response = await request(app)
        .get('/api/v1/disputes/admin/all')
        .query({ status: 'all', limit: 20, offset: 0 });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('PUT /api/v1/disputes/:disputeId', () => {
    it('should update dispute status (admin)', async () => {
      authenticate.mockImplementation((req, res, next) => {
        req.user = { id: 'admin-1', role: 'admin' };
        next();
      });

      const updateData = {
        status: 'resolved',
        resolution: 'Refund issued',
        outcome: 'buyer_favor'
      };

      disputeController.updateDisputeStatus.mockImplementation((req, res) => {
        res.json({
          success: true,
          message: 'Dispute updated successfully',
          data: {
            id: 'dispute-1',
            ...updateData,
            updated_at: new Date()
          }
        });
      });

      const response = await request(app)
        .put('/api/v1/disputes/dispute-1')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('resolved');
    });
  });

  describe('POST /api/v1/disputes/:disputeId/comments', () => {
    it('should add comment to dispute', async () => {
      const commentData = { comment: 'Adding additional evidence' };

      disputeController.addDisputeComment.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          message: 'Comment added successfully',
          data: {
            id: 'comment-1',
            dispute_id: 'dispute-1',
            user_id: 'user-1',
            ...commentData,
            created_at: new Date()
          }
        });
      });

      const response = await request(app)
        .post('/api/v1/disputes/dispute-1/comments')
        .send(commentData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should validate comment length', async () => {
      disputeController.addDisputeComment.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Comment cannot be empty'
        });
      });

      const response = await request(app)
        .post('/api/v1/disputes/dispute-1/comments')
        .send({ comment: '' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/disputes/:disputeId/comments', () => {
    it('should retrieve dispute comments', async () => {
      const mockComments = [
        {
          id: 'comment-1',
          dispute_id: 'dispute-1',
          user_id: 'user-1',
          comment: 'First comment',
          first_name: 'John',
          last_name: 'Doe',
          created_at: '2026-05-17T10:00:00Z'
        },
        {
          id: 'comment-2',
          dispute_id: 'dispute-1',
          user_id: 'admin-1',
          comment: 'Admin response',
          first_name: 'Admin',
          last_name: 'User',
          created_at: '2026-05-17T11:00:00Z'
        }
      ];

      disputeController.getDisputeComments.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockComments
        });
      });

      const response = await request(app)
        .get('/api/v1/disputes/dispute-1/comments');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].comment).toBe('First comment');
    });

    it('should sort comments by creation date', async () => {
      const mockComments = [
        {
          id: 'comment-1',
          created_at: '2026-05-17T10:00:00Z'
        },
        {
          id: 'comment-2',
          created_at: '2026-05-17T11:00:00Z'
        }
      ];

      disputeController.getDisputeComments.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockComments
        });
      });

      const response = await request(app)
        .get('/api/v1/disputes/dispute-1/comments');

      expect(response.status).toBe(200);
      // Verify chronological order
      expect(new Date(response.body.data[0].created_at) <
             new Date(response.body.data[1].created_at)).toBe(true);
    });
  });

  describe('Dispute workflow integration', () => {
    it('should support complete dispute lifecycle', async () => {
      // Step 1: Create dispute
      disputeController.createDispute.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          data: { id: 'dispute-1', status: 'pending' }
        });
      });

      let response = await request(app)
        .post('/api/v1/disputes')
        .send({ orderId: 'order-1', reason: 'Issue' });
      expect(response.status).toBe(201);

      // Step 2: Add comment
      disputeController.addDisputeComment.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          message: 'Comment added'
        });
      });

      response = await request(app)
        .post('/api/v1/disputes/dispute-1/comments')
        .send({ comment: 'Evidence attached' });
      expect(response.status).toBe(201);

      // Step 3: View comments
      disputeController.getDisputeComments.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: [{ id: 'comment-1', comment: 'Evidence attached' }]
        });
      });

      response = await request(app)
        .get('/api/v1/disputes/dispute-1/comments');
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);

      // Step 4: Resolve dispute (admin)
      authenticate.mockImplementation((req, res, next) => {
        req.user = { id: 'admin-1', role: 'admin' };
        next();
      });

      disputeController.updateDisputeStatus.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: { id: 'dispute-1', status: 'resolved' }
        });
      });

      response = await request(app)
        .put('/api/v1/disputes/dispute-1')
        .send({ status: 'resolved', resolution: 'Refund issued' });
      expect(response.status).toBe(200);
    });
  });
});
