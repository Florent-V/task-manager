import dotenv from 'dotenv';

dotenv.config();

export default {
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtPrivateKey: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
  jwtPublicKey: process.env.PUBLIC_KEY.replace(/\\n/g, '\n'),
  cookieSecret: process.env.COOKIE_SECRET,
  accessTokenLifetime: process.env.ACCESS_TOKEN_LIFETIME,
  refreshTokenLifetime: process.env.REFRESH_TOKEN_LIFETIME,
  sessionCookieLifetime: process.env.SESSION_COOKIE_LIFETIME,
  refreshTokenCookieLifetime: process.env.REFRESH_TOKEN_COOKIE_LIFETIME,
};
