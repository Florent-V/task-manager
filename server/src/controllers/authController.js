import User from '../models/userModel.js';
import config from '../config/config.js';
import { findOrCreateSsoUser, getProfile } from '../services/authService.js';
import {
  authorizationRequest,
  finishLogin,
  logoutUrl,
  verifyLogoutToken,
  markRevoked,
} from '../services/oauthService.js';
import { destroySession } from '../middleware/authMiddleware.js';
import InvalidTokenError from '../error/invalidTokenError.js';
import logger from '../config/logger.js';

// Page du front où revenir après la connexion : chemin local uniquement (pas de redirection ouverte)
const safeReturnTo = (value) =>
  typeof value === 'string' && /^\/(?![/\\])/.test(value) ? value : '/';

// GET /api/auth/login : redirection vers le serveur OAuth2 (state + PKCE gardés en session)
export const login = (req, res, next) => {
  const { url, pending } = authorizationRequest();
  req.session.oauthPending = { ...pending, returnTo: safeReturnTo(req.query.returnTo) };
  req.session.save((error) => (error ? next(error) : res.redirect(url)));
};

// GET /api/auth/callback : échange du code, rattachement du compte local, ouverture de la session
export const callback = async (req, res) => {
  const pending = req.session.oauthPending;
  delete req.session.oauthPending;

  try {
    const { userInfo, tokens } = await finishLogin(req.query, pending);
    const user = await findOrCreateSsoUser(userInfo);

    // Nouvel identifiant de session (fixation de session)
    await new Promise((resolve, reject) =>
      req.session.regenerate((error) => (error ? reject(error) : resolve()))
    );
    req.session.auth = {
      user: { id: user.id, username: user.username, ssoId: user.ssoId },
      tokens,
      loggedInAt: Date.now(),
    };
    await new Promise((resolve, reject) =>
      req.session.save((error) => (error ? reject(error) : resolve()))
    );

    return res.redirect(`${config.clientOrigin}${pending.returnTo}`);
  } catch (error) {
    logger.error('OAuth2 callback failed:', { message: error.message, stack: error.stack });
    return res.redirect(`${config.clientOrigin}/signin?error=login_failed`);
  }
};

// GET /api/auth/logout : déconnexion locale, puis globale sur le serveur OAuth2
export const logout = async (req, res) => {
  await destroySession(req).catch((error) =>
    logger.error('Error during logout:', { message: error.message, stack: error.stack })
  );
  return res.redirect(logoutUrl(`${config.clientOrigin}/`));
};

// POST /api/auth/backchannel-logout : appelé par le serveur OAuth2 (pas par un navigateur)
// quand un utilisateur est révoqué (accès retiré, compte bloqué, « déconnecter partout »...)
export const backchannelLogout = async (req, res) => {
  res.set('Cache-Control', 'no-store');
  let ssoId;
  try {
    ssoId = verifyLogoutToken(String(req.body?.logout_token ?? ''));
  } catch (error) {
    return res.status(400).json({ error: 'invalid_request', error_description: error.message });
  }
  try {
    await markRevoked(ssoId);
  } catch (error) {
    // 5xx : le serveur OAuth2 réessaie
    logger.error('Back-channel logout not recorded:', {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ error: 'server_error' });
  }
  logger.info('Back-channel logout received', { ssoId });
  return res.status(200).json({});
};

// GET /api/auth/me : profil de l'utilisateur connecté
export const me = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      await destroySession(req);
      throw new InvalidTokenError('Access Denied: user no longer exists');
    }
    res.data = await getProfile(user);
    next();
  } catch (error) {
    return next(error);
  }
};

export const checkAuth = (req, res, next) => {
  res.data = {
    username: req.user.username,
    isAuthenticated: true,
  };
  next();
};
