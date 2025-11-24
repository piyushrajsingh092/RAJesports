import express from 'express';
import { sendBroadcast, sendTestEmail, getNotifications, markNotificationAsRead } from '../controllers/notificationController';

const router = express.Router();

router.post('/broadcast', sendBroadcast);
router.post('/test', sendTestEmail);
router.get('/', getNotifications);
router.put('/:id/read', markNotificationAsRead);

export default router;
