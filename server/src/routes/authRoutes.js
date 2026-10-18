import express from 'express';
import {
  login,
  callback,
  logout,
  backchannelLogout,
  me,
  checkAuth,
} from '../controllers/authController.js';
import { authenticateByCookieSession } from '../middleware/authMiddleware.js';

const router = express.Router();

// Connexion déléguée au serveur OAuth2 (SSO) : navigation du navigateur, pas des appels XHR
router.get('/login', login);
router.get('/callback', callback);
router.get('/logout', logout);
// Appelée de serveur à serveur par le serveur OAuth2
router.post('/backchannel-logout', backchannelLogout);

router.get('/me', authenticateByCookieSession, me);
router.get('/check', authenticateByCookieSession, checkAuth);

export default router;
