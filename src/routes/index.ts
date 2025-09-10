import { Router } from 'express';
import { router as authRoutes } from '../modules/common/routes.js';

export const router = Router();

// Feature module mounts
router.use('/auth', authRoutes);


