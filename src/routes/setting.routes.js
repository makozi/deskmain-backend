import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as settingController from '../controllers/setting.controller.js';

const router = express.Router();

router.get('/user-settings', authenticate, settingController.getSettings);
router.put('/user-settings', authenticate, settingController.updateSettings);
router.get('/email-preferences', authenticate, settingController.getEmailPreferences);
router.put('/email-preferences', authenticate, settingController.updateEmailPreferences);
router.get('/privacy-settings', authenticate, settingController.getPrivacySettings);
router.put('/privacy-settings', authenticate, settingController.updatePrivacySettings);
router.post('/delete-account', authenticate, settingController.deleteAccount);
router.get('/system-settings', settingController.getSystemSettings);

export default router;
