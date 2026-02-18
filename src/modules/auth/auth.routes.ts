import { Router } from 'express';
import { handleLogin } from './auth.controller';

const router = Router();

router.post('/', handleLogin);

export default router;