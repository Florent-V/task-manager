import RefreshToken from '../models/refreshTokenModel.js';
import config from '../config/config.js';
import jwt from 'jsonwebtoken';
import RefreshTokenError from '../error/refreshTokenError.js';

export function createAuthTokens(user) {
  const token = generateToken(user.id, user.username);
  const refreshToken = generateRefreshToken(user.id, user.username);
  return { token, refreshToken };
}

export const generateToken = (id, username) => {
  console.log('config.accessTokenLifetime:', config.accessTokenLifetime);
  return jwt.sign(
    { id, username },
    config.jwtPrivateKey,
    { 
      expiresIn: config.accessTokenLifetime,
      algorithm: 'RS256'
     }
  );
};

export const generateRefreshToken = (id, username) => {
  return jwt.sign(
    { id, username },
    config.jwtRefreshSecret,
    { 
      expiresIn: config.refreshTokenLifetime,
    }
  );
}

export async function storeRefreshToken(user, refreshToken) {
  // Update existing refresh token
  const existingToken = await user.getRefreshToken();
  if (existingToken) {
    existingToken.token = refreshToken;
    existingToken.expires = new Date().setDate(new Date().getDate() + 7);
    return await existingToken.save();
  }
  // Create new refresh token
  return await user.createRefreshToken({
    token: refreshToken,
    expires: new Date().setDate(new Date().getDate() + 7),
  });
}

export async function rotateRefreshToken(refreshTokenEntity, newRefreshToken) {
  refreshTokenEntity.token = newRefreshToken;
  refreshTokenEntity.expires = new Date().setDate(new Date().getDate() + 7);
  return await refreshTokenEntity.save();
}

export async function validateRefreshToken(refreshToken) {
  if (!refreshToken) throw new RefreshTokenError('Access Denied: No refresh token provided');

  const decodedRefreshToken = authRefreshToken(refreshToken);
  const userId = decodedRefreshToken.id;

  const userRefreshTokenEntity = await getUserRefreshToken(userId);
  const isValid = await userRefreshTokenEntity.isValid(refreshToken);
  if (!isValid) {
    throw new RefreshTokenError('Invalid refresh token');
  }
  return { userRefreshTokenEntity, userId };
}

export async function getUserRefreshToken(userId) {
  // Recherche du refresh token en base de données pour cet utilisateur
  const refreshTokenBDD = await RefreshToken.findOne({ where: { userId: userId } });

  if (!refreshTokenBDD) throw new RefreshTokenError('User has no refresh token, Sign in again');

  return refreshTokenBDD;
}

export const authToken = (token) => {
  return jwt.verify(token, config.jwtPublicKey);
};

export const authRefreshToken = (token) => {
  return jwt.verify(token, config.jwtRefreshSecret);
};

export const decode = (token) => {
  return jwt.decode(token);
}
