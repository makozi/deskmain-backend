import request from 'supertest';
import express from 'express';
import analyticsRoutes from '../../routes/analytics.routes.js';
import * as analyticsController from '../../controllers/analytics.controller.js';
import { authenticate } from '../../middleware/auth.js';

jest.mock('../../controllers/analytics.controller.js');
jest.mock('../../middleware/auth.js');

describe('Analytics Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    authenticate.mockImplementation((req, res, next) => {
      req.user = { id: 'user-1', role: 'admin' };
      next();
    });

    app.use('/api/v1/analytics', analyticsRoutes);

    jest.clearAllMocks();
  });

  describe('GET /api/v1/analytics/platform', () => {
    it('should return platform analytics (admin only)', async () => {
      const mockAnalytics = {
        totalUsers: 1000,
        totalTransactions: 5000,
        platformRevenue: 50000.00,
        conversionRate: '3.2%'
      };

      analyticsController.getPlatformAnalytics.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockAnalytics
        });
      });

      const response = await request(app)
        .get('/api/v1/analytics/platform')
        .query({ days: 30 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalUsers).toBe(1000);
    });

    it('should accept days parameter for time period', async () => {
      analyticsController.getPlatformAnalytics.mockImplementation((req, res) => {
        res.json({ success: true, data: {} });
      });

      const response = await request(app)
        .get('/api/v1/analytics/platform')
        .query({ days: 90 });

      expect(response.status).toBe(200);
      expect(analyticsController.getPlatformAnalytics).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/analytics/user', () => {
    it('should return user analytics', async () => {
      const mockAnalytics = {
        totalOrders: 10,
        totalSpent: 500.00,
        averageOrderValue: 50.00,
        lastPurchaseDate: '2026-05-17'
      };

      analyticsController.getUserAnalytics.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockAnalytics
        });
      });

      const response = await request(app)
        .get('/api/v1/analytics/user')
        .query({ days: 30 });

      expect(response.status).toBe(200);
      expect(response.body.data.totalOrders).toBe(10);
    });
  });

  describe('GET /api/v1/analytics/merchant', () => {
    it('should return merchant analytics', async () => {
      authenticate.mockImplementation((req, res, next) => {
        req.user = { id: 'merchant-1', role: 'merchant' };
        next();
      });

      const mockAnalytics = {
        totalRevenue: 5000.00,
        totalOrders: 100,
        averageOrderValue: 50.00,
        topProducts: ['product-1', 'product-2']
      };

      analyticsController.getMerchantAnalytics.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockAnalytics
        });
      });

      const response = await request(app)
        .get('/api/v1/analytics/merchant')
        .query({ days: 30 });

      expect(response.status).toBe(200);
      expect(response.body.data.totalRevenue).toBe(5000.00);
    });
  });

  describe('GET /api/v1/analytics/product/:productId', () => {
    it('should return product analytics', async () => {
      const mockAnalytics = {
        totalSales: 100,
        totalRevenue: 9999.00,
        averageRating: 4.5,
        totalReviews: 50,
        conversionRate: '2.5%'
      };

      analyticsController.getProductAnalytics.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockAnalytics
        });
      });

      const response = await request(app)
        .get('/api/v1/analytics/product/product-1')
        .query({ days: 30 });

      expect(response.status).toBe(200);
      expect(response.body.data.totalSales).toBe(100);
      expect(response.body.data.averageRating).toBe(4.5);
    });

    it('should require authentication', async () => {
      authenticate.mockImplementation((req, res, next) => {
        res.status(401).json({ success: false, message: 'Unauthorized' });
      });

      const response = await request(app)
        .get('/api/v1/analytics/product/product-1');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/analytics/search', () => {
    it('should return search analytics', async () => {
      const mockAnalytics = {
        totalSearches: 1500,
        uniqueSearches: 450,
        topSearchTerms: ['laptop', 'phone', 'headphones'],
        conversionRate: '15.5%'
      };

      analyticsController.getSearchAnalytics.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockAnalytics
        });
      });

      const response = await request(app)
        .get('/api/v1/analytics/search')
        .query({ days: 30 });

      expect(response.status).toBe(200);
      expect(response.body.data.topSearchTerms).toHaveLength(3);
    });
  });

  describe('GET /api/v1/analytics/transactions', () => {
    it('should return transaction analytics', async () => {
      const mockAnalytics = {
        totalTransactions: 5000,
        totalAmount: 500000.00,
        averageAmount: 100.00,
        successRate: '98.5%',
        failureRate: '1.5%'
      };

      analyticsController.getTransactionAnalytics.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockAnalytics
        });
      });

      const response = await request(app)
        .get('/api/v1/analytics/transactions')
        .query({ days: 30 });

      expect(response.status).toBe(200);
      expect(response.body.data.successRate).toBe('98.5%');
    });
  });

  describe('Analytics date range filtering', () => {
    it('should support different date ranges', async () => {
      analyticsController.getPlatformAnalytics.mockImplementation((req, res) => {
        res.json({ success: true, data: { period: req.query.days } });
      });

      // Test 7 days
      let response = await request(app)
        .get('/api/v1/analytics/platform')
        .query({ days: 7 });
      expect(response.status).toBe(200);

      // Test 90 days
      response = await request(app)
        .get('/api/v1/analytics/platform')
        .query({ days: 90 });
      expect(response.status).toBe(200);

      // Test 365 days
      response = await request(app)
        .get('/api/v1/analytics/platform')
        .query({ days: 365 });
      expect(response.status).toBe(200);
    });
  });
});
