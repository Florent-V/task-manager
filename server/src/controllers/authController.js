import User from '../models/userModel.js';
import { hashPassword } from '../services/passwordService.js';
import RefreshTokenError from '../error/refreshTokenError.js';
import config from '../config/config.js';
import { authenticateUser } from '../services/authService.js';
import { createAuthTokens, storeRefreshToken, validateRefreshToken, rotateRefreshToken } from '../services/tokenService.js';

const refreshTokensCookieOptions = {
  httpOnly: true,
  secure: true, //process.env.NODE_ENV === 'production',
  sameSite: 'Strict', //process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
  maxAge: config.refreshTokenCookieLifetime,  // 7 jours
  signed: true,  // Active la signature du cookie
  path: '/api/auth/refresh-token'
}

export const signup = async (req, res, next) => {
  try {
    const hashedPassword = await hashPassword(req.body.password);

    const user = await User.create({ 
      ...req.body,
      password: hashedPassword
    });
    await user.setRoles([1]);

    res.status(201).send({ message: "User registered successfully!" });
  } catch (error) {
    return next(error);
  }
};

export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Authentification de l'utilisateur
    const { user, authorities } = await authenticateUser(email, password);

    // Crée les tokens
    const { token, refreshToken } = createAuthTokens(user);

    // Enregistre le refresh token en BDD
    await storeRefreshToken(user, refreshToken);

    req.session.token = token;
    res.cookie('refresh_token', refreshToken, refreshTokensCookieOptions);

    return res.status(200).send({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roles: authorities,
      token,
      //refreshToken
    });
  } catch (error) {
    return next(error);
  }
};

export const handleRefreshToken = async (req, res, next) => {
  try {
    console.log('req.cookies:', req.cookies);
    console.log('req.signedCookies:', req.signedCookies);

    const { userRefreshTokenEntity, userId } = await validateRefreshToken(req.signedCookies.refresh_token);

    const user = await User.findByPk(userId);
    if (!user) {
      throw new RefreshTokenError('Invalid refresh token : no user found');
    }

    // Génération new access token
    const { 
      token: newAccessToken,
      refreshToken: newRefreshTokenValue
    } = createAuthTokens(user);

    // Mise à jour des tokens
    await rotateRefreshToken(userRefreshTokenEntity, newRefreshTokenValue);
    req.session.token = newAccessToken;

    // Mise à jour du refresh token dans le cookie
    res.cookie('refresh_token', newRefreshTokenValue, refreshTokensCookieOptions);

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshTokenValue,
    });
  } catch (error) {
    return next(error);
  }
}

export const logout = (req, res) => {
  try {
    req.session = null;
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      path: '/api/auth/refresh-token'
    });
    
    return res.status(200).send({
      message: "You've been signed out successfully!"
    });
  } catch (error) {
    return next(error);
  }
};
