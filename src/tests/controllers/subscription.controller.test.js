import * as subscriptionController from '../../controllers/subscription.controller.js';
import db from '../../config/database.js';
import logger from '../../config/logger.js';

jest.mock('../../config/database.js');
jest.mock('../../config/logger.js');

describe('Subscription Controller', () => {
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

  describe('createSubscriptionPlan', () => {
    it('should create a new subscription plan', async () => {
      req.body = {
        name: 'Basic',
        price: 9.99,
        billingCycle: 'monthly',
        features: ['Feature 1', 'Feature 2']
      };

      const mockPlan = {
        id: 'plan-1',
        ...req.body,
        created_at: new Date()
      };

      db.query.mockResolvedValueOnce({ rows: [mockPlan] });

      await subscriptionController.createSubscriptionPlan(req, res);

      expect(db.query).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('getAllPlans', () => {
    it('should retrieve all subscription plans', async () => {
      const mockPlans = [
        { id: 'plan-1', name: 'Basic', price: 9.99 },
        { id: 'plan-2', name: 'Pro', price: 19.99 }
      ];

      db.query.mockResolvedValueOnce({ rows: mockPlans });

      await subscriptionController.getAllPlans(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPlans
      });
    });
  });

  describe('subscribeUser', () => {
    it('should subscribe user to a plan', async () => {
      req.params = { planId: 'plan-1' };

      const mockSubscription = {
        id: 'sub-1',
        user_id: 'user-1',
        plan_id: 'plan-1',
        status: 'active'
      };

      db.query.mockResolvedValueOnce({ rows: [{ id: 'plan-1' }] })
              .mockResolvedValueOnce({ rows: [mockSubscription] });

      await subscriptionController.subscribeUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel user subscription', async () => {
      req.params = { subscriptionId: 'sub-1' };

      db.query.mockResolvedValueOnce({ rows: [{ id: 'sub-1', status: 'cancelled' }] });

      await subscriptionController.cancelSubscription(req, res);

      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getUserSubscription', () => {
    it('should retrieve user subscription', async () => {
      const mockSubscription = {
        id: 'sub-1',
        plan_id: 'plan-1',
        status: 'active'
      };

      db.query.mockResolvedValueOnce({ rows: [mockSubscription] });

      await subscriptionController.getUserSubscription(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockSubscription
      });
    });
  });
});
