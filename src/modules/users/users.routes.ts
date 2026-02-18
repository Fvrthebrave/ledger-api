import { Router } from 'express';
import { handleCreateUser } from './users.controller';

const router = Router();

router.post('/', handleCreateUser);

export default router;