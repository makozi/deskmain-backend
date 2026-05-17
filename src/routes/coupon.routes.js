import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as couponController from '../controllers/coupon.controller.js';

const router = express.Router();

router.post('/', authenticate, couponController.createCoupon);
router.get('/', couponController.getAllCoupons);
router.get('/:code', couponController.getCoupon);
router.put('/:couponId', authenticate, couponController.updateCoupon);
router.delete('/:couponId', authenticate, couponController.deleteCoupon);
router.post('/validate', couponController.validateCoupon);
router.post('/apply', authenticate, couponController.applyCoupon);

export default router;
