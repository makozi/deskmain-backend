import * as disputeController from '../../controllers/dispute.controller.js';
import db from '../../config/database.js';
import logger from '../../config/logger.js';

jest.mock('../../config/database.js');
jest.mock('../../config/logger.js');

describe('Dispute Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: 'user-1', role: 'user' },
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

  describe('createDispute', () => {
    it('should create a new dispute', async () => {
      req.body = {
        orderId: 'order-1',
        reason: 'Item not as described',
        description: 'The product quality is poor',
        evidenceUrls: ['https://example.com/photo1.jpg']
      };

      const mockOrder = {
        id: 'order-1',
        user_id: 'user-1',
        merchant_id: 'merchant-1'
      };

      const mockDispute = {
        id: 'dispute-1',
        ...req.body,
        buyer_id: 'user-1',
        seller_id: 'merchant-1',
        status: 'pending',
        created_at: new Date()
      };

      db.query.mockResolvedValueOnce({ rows: [mockOrder] })
              .mockResolvedValueOnce({ rows: [mockDispute] });

      await disputeController.createDispute(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });

    it('should return 404 if order not found', async () => {
      req.body = { orderId: 'non-existent' };

      db.query.mockResolvedValueOnce({ rows: [] });

      await disputeController.createDispute(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('getDispute', () => {
    it('should retrieve a dispute', async () => {
      req.params = { disputeId: 'dispute-1' };

      const mockDispute = {
        id: 'dispute-1',
        buyer_id: 'user-1',
        reason: 'Item not as described',
        status: 'pending',
        evidence_urls: '["https://example.com/photo1.jpg"]'
      };

      db.query.mockResolvedValueOnce({ rows: [mockDispute] });

      await disputeController.getDispute(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: 'dispute-1',
          evidenceUrls: expect.any(Array)
        })
      });
    });
  });

  describe('getUserDisputes', () => {
    it('should retrieve user disputes', async () => {
      req.query = { limit: 20, offset: 0 };

      const mockDisputes = [
        {
          id: 'dispute-1',
          buyer_id: 'user-1',
          status: 'pending'
        }
      ];

      db.query.mockResolvedValueOnce({ rows: mockDisputes });

      await disputeController.getUserDisputes(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockDisputes
      });
    });

    it('should filter disputes by status', async () => {
      req.query = { status: 'resolved', limit: 20, offset: 0 };

      const mockDisputes = [];

      db.query.mockResolvedValueOnce({ rows: mockDisputes });

      await disputeController.getUserDisputes(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: []
      });
    });
  });

  describe('getAllDisputes', () => {
    it('should retrieve all disputes for admin', async () => {
      req.user.role = 'admin';
      req.query = { status: 'pending', limit: 20, offset: 0 };

      const mockDisputes = [
        { id: 'dispute-1', status: 'pending' }
      ];

      db.query.mockResolvedValueOnce({ rows: mockDisputes });

      await disputeController.getAllDisputes(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockDisputes
      });
    });
  });

  describe('updateDisputeStatus', () => {
    it('should update dispute status', async () => {
      req.params = { disputeId: 'dispute-1' };
      req.body = {
        status: 'resolved',
        resolution: 'Refund issued',
        outcome: 'buyer_favor'
      };

      const updatedDispute = {
        id: 'dispute-1',
        ...req.body,
        updated_at: new Date()
      };

      db.query.mockResolvedValueOnce({ rows: [updatedDispute] });

      await disputeController.updateDisputeStatus(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Dispute updated successfully',
        data: updatedDispute
      });
    });
  });

  describe('addDisputeComment', () => {
    it('should add a comment to dispute', async () => {
      req.params = { disputeId: 'dispute-1' };
      req.body = { comment: 'Adding evidence for the case' };

      const mockComment = {
        id: 'comment-1',
        dispute_id: 'dispute-1',
        user_id: 'user-1',
        comment: 'Adding evidence for the case',
        created_at: new Date()
      };

      db.query.mockResolvedValueOnce({ rows: [mockComment] });

      await disputeController.addDisputeComment(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Comment added successfully',
        data: mockComment
      });
    });
  });

  describe('getDisputeComments', () => {
    it('should retrieve dispute comments', async () => {
      req.params = { disputeId: 'dispute-1' };

      const mockComments = [
        {
          id: 'comment-1',
          dispute_id: 'dispute-1',
          user_id: 'user-1',
          comment: 'Test comment',
          first_name: 'John',
          last_name: 'Doe'
        }
      ];

      db.query.mockResolvedValueOnce({ rows: mockComments });

      await disputeController.getDisputeComments(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockComments
      });
    });
  });
});
