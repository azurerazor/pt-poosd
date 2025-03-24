import { requireAuth } from '../middleware/auth.js';
import { Router } from 'express';

// Set up the Express router
const router = Router();
router.use(requireAuth);

export default router;
