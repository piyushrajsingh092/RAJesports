import express from 'express';
import { cancelTournament } from '../controllers/cancelController';

const router = express.Router();

router.post('/cancel', cancelTournament);

export default router;
