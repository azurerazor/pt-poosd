import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Router, Request, Response } from 'express';

// Set up the Express router
const router = Router();
router.use(requireAuth);

export default router;
