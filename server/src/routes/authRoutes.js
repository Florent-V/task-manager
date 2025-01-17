import express from 'express';
import {
  signup,
  signin,
  logout,
  handleRefreshToken
} from '../controllers/authController.js';
import {
  setSignupValidator,
  setSigninValidator
} from '../middleware/userMiddleware.js';
import { validate } from '../middleware/ressourceMiddleware.js';
import {
  checkDuplicateUsernameOrEmail,
  authenticateByCookieSession,
  checkAuth
} from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/check', authenticateByCookieSession, checkAuth);
router.post('/signup', setSignupValidator, validate, checkDuplicateUsernameOrEmail, signup);
router.post('/signin', setSigninValidator, validate, signin);
router.post('/refresh-token', handleRefreshToken);
router.post('/logout', logout);

export default router;
