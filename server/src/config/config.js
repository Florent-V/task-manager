import dotenv from 'dotenv';

dotenv.config();

const oauthServerUrl = (process.env.OAUTH_SERVER_URL || '').replace(/\/+$/, '');
// URL utilisée par l'API pour ses appels serveur à serveur (/token, /api/userinfo) ; par défaut l'URL publique
const oauthInternalUrl = (process.env.OAUTH_INTERNAL_URL || oauthServerUrl).replace(/\/+$/, '');

export default {
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    dialect: 'mysql',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  // Serveur d'authentification OAuth2 (SSO) : cette API est le client confidentiel (BFF)
  oauth: {
    serverUrl: oauthServerUrl,
    internalUrl: oauthInternalUrl,
    // « iss » des logout tokens : l'URL publique du serveur
    issuer: (process.env.OAUTH_ISSUER || oauthServerUrl).replace(/\/+$/, ''),
    clientId: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    // ex. https://api.mydomain.com/api/auth/callback
    redirectUri: process.env.OAUTH_REDIRECT_URI,
    // Clé publique PEM du serveur (make prod-public-key), vérification des logout tokens
    publicKey: (process.env.OAUTH_PUBLIC_KEY || '').replace(/\\n/g, '\n'),
  },
  clientOrigin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').replace(/\/+$/, ''),
  sessionSecret: process.env.SESSION_SECRET || process.env.COOKIE_SECRET,
  sessionLifetime: 7 * 24 * 3600 * 1000, // 7 jours en millisecondes
  // false uniquement en développement si le navigateur refuse les cookies Secure en HTTP
  cookieSecure: process.env.COOKIE_SECURE !== 'false',
  ai: {
    provider: process.env.AI_PROVIDER || 'mistral',
    apiUrl: process.env.AI_API_URL,
    apiKey: process.env.AI_API_KEY,
    model: process.env.AI_MODEL,
  },
};
