import { Router } from 'express';
import { handleCreateAccount, handleGetAccountById, handleGetAccountBalance } from './accounts.controller';

const router = Router();

router.post('/', handleCreateAccount);
router.get('/:id', handleGetAccountById);
router.get('/:id/balance', handleGetAccountBalance);

export default router;