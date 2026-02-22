import { Router } from 'express';
import { handleCreateAccount, handleGetAccountById, handleGetAccountBalanceForUser, handleTransfer } from './accounts.controller';

const router = Router();

router.post('/', handleCreateAccount);
router.post('/transfer', handleTransfer);
router.get('/:id', handleGetAccountById);
router.get('/:id/balance', handleGetAccountBalanceForUser);

export default router;
