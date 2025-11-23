import express from 'express';
import { declareWinner } from '../controllers/winnerController';

const router = express.Router();

router.post('/declare', declareWinner);

export default router;
