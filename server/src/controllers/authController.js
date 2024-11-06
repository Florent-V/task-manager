import User from '../models/userModel.js';
import RefreshToken from "../models/refreshTokenModel.js";
import { hashPassword } from '../services/passwordService.js';
import RefreshTokenError from '../error/refreshTokenError.js';
import config from '../config/config.js';
import { authenticateUser } from '../services/authService.js';
import { createAuthTokens, storeRefreshToken, validateRefreshToken, rotateRefreshToken, decodeToken } from '../services/tokenService.js';

// Options des cookies
const refreshTokensCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'Strict',
  maxAge: config.refreshTokenCookieLifetime,
  signed: true,
  path: '/api/auth/refresh-token'
}

const accessTokensCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'Strict',
  maxAge: config.accessTokenCookieLifetime,  // 1 heure
  signed: true,
  path: '/'
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

    // Envoie les tokens dans les cookies
    // res.cookie('refresh_token', refreshToken, refreshTokensCookieOptions);
    res.cookie('access_token', token, accessTokensCookieOptions);

    return res.status(200).send({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roles: authorities,
      //token,
      //refreshToken
    });
  } catch (error) {
    return next(error);
  }
};

export const handleRefreshToken = async (req, res, next) => {
  try {
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

    // Mise à jour du refresh token dans le cookie
    res.cookie('access_token', newAccessToken, accessTokensCookieOptions);
    res.cookie('refresh_token', newRefreshTokenValue, refreshTokensCookieOptions);

    res.status(200).json({
      success: true,
      // accessToken: newAccessToken,
      // refreshToken: newRefreshTokenValue,
    });
  } catch (error) {
    return next(error);
  }
}

export const logout = async (req, res) => {
  try {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      path: '/api/auth/refresh-token'
    });

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      path: '/'
    });

    const token = req.signedCookies.access_token;
    if (token) {
      const decoded = decodeToken(token);
      console.log('decoded:', decoded);
      await RefreshToken.update({ valid: 0 }, { where: { userId: decoded.id } });
    }

    return res.status(200).send({
      message: "You've been signed out successfully!"
    });
  } catch (error) {
    console.log('error', error);
  }
};
