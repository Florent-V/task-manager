import User from '../models/userModel.js';
import { checkAccess } from '../services/authService.js';
import { freshTokens, isRevoked } from '../services/oauthService.js';
import InvalidTokenError from '../error/invalidTokenError.js';
import ForbiddenError from '../error/forbiddenError.js';
import logger from '../config/logger.js';

// Ferme la session de l'application (jetons compris)
export const destroySession = (req) =>
  new Promise((resolve, reject) => {
    if (!req.session) return resolve();
    req.session.destroy((error) => (error ? reject(error) : resolve()));
  });

// À chaque requête protégée : session ouverte ? révoquée par back-channel logout ? jetons à renouveler ?
// Un refus du serveur OAuth2 (accès retiré, compte bloqué, « déconnecter partout »...) ferme la session.
export const authenticateByCookieSession = async (req, res, next) => {
  try {
    const auth = req.session?.auth;
    if (!auth) throw new InvalidTokenError('Access Denied: not signed in');

    if (await isRevoked(auth.user.ssoId, auth.loggedInAt)) {
      await destroySession(req);
      throw new InvalidTokenError('Access Denied: session revoked');
    }

    try {
      auth.tokens = await freshTokens(auth.tokens);
    } catch (error) {
      logger.info('Token refresh refused, closing session', { message: error.message });
      await destroySession(req);
      throw new InvalidTokenError('Access Denied: session closed by the authorization server');
    }

    req.user = { id: auth.user.id, username: auth.user.username, ssoId: auth.user.ssoId };
    next();
  } catch (error) {
    return next(error);
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) throw new ForbiddenError('Require Admin Role!');
    const user = await User.findByPk(req.user.id);
    const roles = await user.getRoles();

    const access = checkAccess(roles, ['admin']);

    if (access) return next();

    throw new ForbiddenError('Require Admin Role!');
  } catch (error) {
    return next(error);
  }
};

export const isModerator = async (req, res, next) => {
  try {
    if (!req.user) throw new ForbiddenError('Require Admin Role!');
    const user = await User.findByPk(req.user.id);
    const roles = await user.getRoles();

    const access = checkAccess(roles, ['moderator']);
    if (access) return next();

    throw new ForbiddenError('Require Moderator Role!');
  } catch (error) {
    return next(error);
  }
};

export const isModeratorOrAdmin = async (req, res, next) => {
  try {
    if (!req.user) throw new ForbiddenError('Require Admin Role!');
    const user = await User.findByPk(req.user.id);
    const roles = await user.getRoles();

    const access = checkAccess(roles, ['moderator', 'admin']);
    if (access) return next();

    throw new ForbiddenError('Require Moderator or Admin Role!');
  } catch (error) {
    return next(error);
  }
};
