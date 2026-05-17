import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as subscriptionController from '../controllers/subscription.controller.js';

const router = express.Router();

router.post('/plans', authenticate, subscriptionController.createSubscriptionPlan);
router.get('/plans', subscriptionController.getAllPlans);
router.get('/plans/:planId', subscriptionController.getSubscriptionPlan);
router.put('/plans/:planId', authenticate, subscriptionController.updateSubscriptionPlan);
router.delete('/plans/:planId', authenticate, subscriptionController.deleteSubscriptionPlan);
router.post('/plans/:planId/subscribe', authenticate, subscriptionController.subscribeUser);
router.post('/subscriptions/:subscriptionId/cancel', authenticate, subscriptionController.cancelSubscription);
router.get('/my-subscription', authenticate, subscriptionController.getUserSubscription);

export default router;
