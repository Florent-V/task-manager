import { Op } from 'sequelize';
import User from '../models/userModel.js';
import { checkAccess } from '../services/authService.js';
import { authToken } from '../services/tokenService.js';
import InvalidTokenError from '../error/invalidTokenError.js';
import ForbiddenError from '../error/forbiddenError.js';
import ConflictError from '../error/conflictError.js';


export const authenticateToken = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) throw new InvalidTokenError('Access Denied: No token provided');
    
    const verified = authToken(token);
    req.user = verified;
    next();
  } catch (error) {
    return next({ ...error, stack: error.stack, status: 401 });
  }
};

export const authenticateByCookieSession = (req, res, next) => {
  // TODO Delete console.log in production
  console.log('req.cookies:', req.cookies);
  console.log('req.signedCookies:', req.signedCookies);
  console.log('req.session:', req.session.token);
  try {
    // TODO Delete auth by header in production use only cookie session
    const token = req.session.token || req.header('Authorization')?.split(' ')[1];

    if (!token) throw new InvalidTokenError('Access Denied: No token provided');

  
    const verified = authToken(token);
    console.log('verified:', verified);
    req.user = verified;
    next();
  } catch (error) {
    return next({ ...error, stack: error.stack, status: 401 });
  }
};

export const checkAuth = (req, res, next) => {
  res.data = {
    username: req.user.username,
    isAuthenticated: true
  }
  next();
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
    const user = await User.findByPk(req.user.ifd);
    const roles = await user.getRoles();

    const access = checkAccess(roles, ['moderator', 'admin']);
    if (access) return next();

    throw new ForbiddenError('Require Moderator or Admin Role!');
  } catch (error) {
    return next(error);
  }
};

export const checkDuplicateUsernameOrEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username: req.body.username },
          { email: req.body.email }
        ]
      }
    });

    if (user) {
      throw new ConflictError(user.username === req.body.username
        ? "Failed! Username is already in use!"
        : "Failed! Email is already in use!");
    }

    next();
  } catch (error) {
    return next(error);
  }
};
