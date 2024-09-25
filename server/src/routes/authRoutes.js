import express from 'express';
import { signup, signin, logout, handleRefreshToken } from '../controllers/authController.js';
import { validateSignup, validateSignin } from '../middleware/userMiddleware.js';
import { checkDuplicateUsernameOrEmail, authenticateByCookieSession, checkAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/check', authenticateByCookieSession, checkAuth);
router.post('/signup', validateSignup, checkDuplicateUsernameOrEmail, signup);
router.post('/signin', validateSignin, signin);
router.post('/refresh-token', handleRefreshToken);
router.post('/logout', logout);

export default router;
