import request from 'supertest';
import express from 'express';
import subscriptionRoutes from '../../routes/subscription.routes.js';
import * as subscriptionController from '../../controllers/subscription.controller.js';
import { authenticate } from '../../middleware/auth.js';

jest.mock('../../controllers/subscription.controller.js');
jest.mock('../../middleware/auth.js');

describe('Subscription Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    authenticate.mockImplementation((req, res, next) => {
      req.user = { id: 'user-1', role: 'user' };
      next();
    });

    app.use('/api/v1/subscriptions', subscriptionRoutes);

    jest.clearAllMocks();
  });

  describe('GET /api/v1/subscriptions/plans', () => {
    it('should return all subscription plans', async () => {
      const mockPlans = [
        { id: 'plan-1', name: 'Basic', price: 9.99, billingCycle: 'monthly' },
        { id: 'plan-2', name: 'Pro', price: 19.99, billingCycle: 'monthly' }
      ];

      subscriptionController.getAllPlans.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockPlans
        });
      });

      const response = await request(app)
        .get('/api/v1/subscriptions/plans');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('POST /api/v1/subscriptions/plans', () => {
    it('should create a subscription plan (admin)', async () => {
      authenticate.mockImplementation((req, res, next) => {
        req.user = { id: 'admin-1', role: 'admin' };
        next();
      });

      const planData = {
        name: 'Premium',
        price: 29.99,
        billingCycle: 'monthly',
        features: ['Feature 1', 'Feature 2', 'Feature 3']
      };

      subscriptionController.createSubscriptionPlan.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          message: 'Plan created',
          data: { id: 'plan-3', ...planData }
        });
      });

      const response = await request(app)
        .post('/api/v1/subscriptions/plans')
        .send(planData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/subscriptions/plans/:planId/subscribe', () => {
    it('should subscribe user to a plan', async () => {
      subscriptionController.subscribeUser.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          message: 'Subscription activated',
          data: {
            id: 'sub-1',
            userId: 'user-1',
            planId: 'plan-1',
            status: 'active'
          }
        });
      });

      const response = await request(app)
        .post('/api/v1/subscriptions/plans/plan-1/subscribe');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/subscriptions/my-subscription', () => {
    it('should return user subscription', async () => {
      const mockSubscription = {
        id: 'sub-1',
        planId: 'plan-1',
        status: 'active',
        expiryDate: '2026-06-17'
      };

      subscriptionController.getUserSubscription.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockSubscription
        });
      });

      const response = await request(app)
        .get('/api/v1/subscriptions/my-subscription');

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe('sub-1');
    });
  });

  describe('POST /api/v1/subscriptions/:subscriptionId/cancel', () => {
    it('should cancel subscription', async () => {
      subscriptionController.cancelSubscription.mockImplementation((req, res) => {
        res.json({
          success: true,
          message: 'Subscription cancelled',
          data: { id: 'sub-1', status: 'cancelled' }
        });
      });

      const response = await request(app)
        .post('/api/v1/subscriptions/sub-1/cancel');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
