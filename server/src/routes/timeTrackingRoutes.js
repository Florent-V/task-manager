import express from 'express';
import { authenticateByCookieSession } from '../middleware/authMiddleware.js';
import { getImputationsForUser } from '../controllers/imputationController.js';

const router = express.Router();

// Route to get all imputations for a specific User
router.get('/me', authenticateByCookieSession, getImputationsForUser);

export default router;
