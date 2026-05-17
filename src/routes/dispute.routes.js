import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as disputeController from '../controllers/dispute.controller.js';

const router = express.Router();

router.post('/', authenticate, disputeController.createDispute);
router.get('/:disputeId', authenticate, disputeController.getDispute);
router.get('/', authenticate, disputeController.getUserDisputes);
router.get('/admin/all', authenticate, disputeController.getAllDisputes);
router.put('/:disputeId/status', authenticate, disputeController.updateDisputeStatus);
router.post('/:disputeId/comments', authenticate, disputeController.addDisputeComment);
router.get('/:disputeId/comments', authenticate, disputeController.getDisputeComments);

export default router;
