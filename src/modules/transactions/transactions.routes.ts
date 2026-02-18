import { Router } from 'express';
import {
  handleCreateTransaction,
  handleGetTransactionsByAccount
} from './transactions.controller';

const router = Router();

router.post('/', handleCreateTransaction);
router.get('/:accountId', handleGetTransactionsByAccount);

export default router;