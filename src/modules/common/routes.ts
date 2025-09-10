import { Router } from 'express';
import { login, me } from '../../modules/auth/controllers/auth.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const router = Router();

router.post('/login', login);
router.get('/me', requireAuth, me);


