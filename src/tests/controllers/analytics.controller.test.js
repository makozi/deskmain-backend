import * as analyticsController from '../../controllers/analytics.controller.js';
import db from '../../config/database.js';
import logger from '../../config/logger.js';

jest.mock('../../config/database.js');
jest.mock('../../config/logger.js');

describe('Analytics Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: 'user-1', role: 'admin' },
      params: {},
      body: {},
      query: { days: 30 }
    };

    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };

    jest.clearAllMocks();
  });

  describe('getPlatformAnalytics', () => {
    it('should retrieve platform analytics', async () => {
      const mockAnalytics = {
        totalUsers: 1000,
        totalTransactions: 5000,
        platformRevenue: 50000.00,
        conversionRate: 3.2
      };

      db.query.mockResolvedValueOnce({ rows: [mockAnalytics] });

      await analyticsController.getPlatformAnalytics(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockAnalytics
      });
    });
  });

  describe('getUserAnalytics', () => {
    it('should retrieve user analytics', async () => {
      const mockAnalytics = {
        totalOrders: 10,
        totalSpent: 500.00,
        averageOrderValue: 50.00,
        lastPurchaseDate: new Date()
      };

      db.query.mockResolvedValueOnce({ rows: [mockAnalytics] });

      await analyticsController.getUserAnalytics(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockAnalytics
      });
    });
  });

  describe('getMerchantAnalytics', () => {
    it('should retrieve merchant analytics', async () => {
      req.user.id = 'merchant-1';

      const mockAnalytics = {
        totalRevenue: 5000.00,
        totalOrders: 100,
        averageOrderValue: 50.00,
        topProducts: ['product-1', 'product-2']
      };

      db.query.mockResolvedValueOnce({ rows: [mockAnalytics] });

      await analyticsController.getMerchantAnalytics(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockAnalytics
      });
    });
  });

  describe('getProductAnalytics', () => {
    it('should retrieve product analytics', async () => {
      req.params = { productId: 'product-1' };

      const mockAnalytics = {
        totalSales: 100,
        totalRevenue: 9999.00,
        averageRating: 4.5,
        totalReviews: 50
      };

      db.query.mockResolvedValueOnce({ rows: [mockAnalytics] });

      await analyticsController.getProductAnalytics(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockAnalytics
      });
    });
  });
});
