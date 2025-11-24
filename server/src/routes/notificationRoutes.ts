import express from 'express';
import { sendBroadcast } from '../controllers/notificationController';

const router = express.Router();

router.post('/broadcast', sendBroadcast);

export default router;
