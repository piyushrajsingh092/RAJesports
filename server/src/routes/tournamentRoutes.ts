import express from 'express';
import { getTournaments, createTournament, updateTournament, joinTournament, deleteTournament } from '../controllers/tournamentController';

const router = express.Router();

router.get('/', getTournaments);
router.post('/', createTournament); // Add auth middleware later
router.put('/:id', updateTournament); // Add auth middleware later
router.post('/:id/join', joinTournament); // Add auth middleware later
router.delete('/:id', deleteTournament); // Add auth middleware later

export default router;
