import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as analyticsController from '../controllers/analytics.controller.js';

const router = express.Router();

router.get('/platform', authenticate, analyticsController.getPlatformAnalytics);
router.get('/user', authenticate, analyticsController.getUserAnalytics);
router.get('/merchant', authenticate, analyticsController.getMerchantAnalytics);
router.get('/product/:productId', analyticsController.getProductAnalytics);

export default router;
