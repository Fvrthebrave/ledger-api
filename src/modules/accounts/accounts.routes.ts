import { Router } from 'express';
import { handleCreateAccount, handleGetAccountById, handleGetAccountBalanceForUser, handleTransfer } from './accounts.controller';
import { authenticate } from '../auth/auth.middleware';

const router = Router();

router.post('/', authenticate, handleCreateAccount);
router.post('/transfer', authenticate, handleTransfer);
router.get('/:id', authenticate, handleGetAccountById);
router.get('/:id/balance', authenticate, handleGetAccountBalanceForUser);

export default router;