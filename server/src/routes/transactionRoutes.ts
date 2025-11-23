import express from 'express';
import { getTransactions, requestDeposit, requestWithdrawal, approveTransaction, rejectTransaction } from '../controllers/transactionController';

const router = express.Router();

router.get('/', getTransactions);
router.post('/deposit', requestDeposit);
router.post('/withdraw', requestWithdrawal);
router.put('/:id/approve', approveTransaction); // Admin only
router.put('/:id/reject', rejectTransaction); // Admin only

export default router;
