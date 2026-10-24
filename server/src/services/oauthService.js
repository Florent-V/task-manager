import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import OAuthError from '../error/oauthError.js';
import OAuthRevocation from '../models/oauthRevocationModel.js';

const LOGOUT_EVENT = 'http://schemas.openid.net/event/backchannel-logout';
// Identifiant public des utilisateurs du serveur OAuth2 (« id » de /api/userinfo, « uid » des JWT)
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const b64url = (buffer) => buffer.toString('base64url');

//
// 1. Connexion : Authorization Code + PKCE (S256) + state
//

// URL de /authorize et valeurs à garder en session jusqu'au retour sur le callback
export function authorizationRequest() {
  const pending = {
    state: b64url(crypto.randomBytes(16)),
    verifier: b64url(crypto.randomBytes(48)),
  };
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.oauth.clientId,
    redirect_uri: config.oauth.redirectUri,
    scope: 'profile email',
    state: pending.state,
    code_challenge: b64url(crypto.createHash('sha256').update(pending.verifier).digest()),
    code_challenge_method: 'S256',
  });
  return { url: `${config.oauth.serverUrl}/authorize?${params}`, pending };
}

async function tokenRequest(params) {
  const response = await fetch(`${config.oauth.internalUrl}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.oauth.clientId,
      client_secret: config.oauth.clientSecret,
      ...params,
    }),
    signal: AbortSignal.timeout(10000),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new OAuthError(`Token request refused: ${body.error ?? response.status}`);
  }
  return body;
}

// Jetons gardés dans la session (côté serveur uniquement), renouvelés 30 s avant leur expiration
function forSession(tokens) {
  const lifetime = Number(tokens.expires_in) * 1000;
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    refreshAt: Date.now() + Math.max(lifetime - 30000, lifetime / 2),
  };
}

// Traite le retour sur la redirect URI : renvoie l'utilisateur (/api/userinfo) et les jetons
export async function finishLogin(query, pending) {
  if (query.error) throw new OAuthError(`Authorization refused: ${query.error}`);
  const state = String(query.state ?? '');
  if (
    !pending ||
    state.length !== pending.state.length ||
    !crypto.timingSafeEqual(Buffer.from(state), Buffer.from(pending.state))
  ) {
    throw new OAuthError('Invalid state');
  }

  const tokens = await tokenRequest({
    grant_type: 'authorization_code',
    code: String(query.code ?? ''),
    redirect_uri: config.oauth.redirectUri,
    code_verifier: pending.verifier,
  });

  const response = await fetch(`${config.oauth.internalUrl}/api/userinfo`, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new OAuthError(`Userinfo refused: ${response.status}`);
  const userInfo = await response.json();
  if (!UUID_PATTERN.test(String(userInfo.id ?? ''))) throw new OAuthError('Userinfo without id');

  return { userInfo, tokens: forSession(tokens) };
}

export function logoutUrl(returnUrl) {
  return `${config.oauth.serverUrl}/logout?${new URLSearchParams({ redirect_uri: returnUrl })}`;
}

//
// 2. Renouvellement des jetons (rotation du refresh token)
//

// Renouvellements en cours ou récents, par refresh token consommé : des requêtes simultanées (onglets, appels
// en parallèle) partagent le même résultat, car un refresh token n'est utilisable qu'une fois.
// En mémoire : suffisant avec une seule instance de l'API. Avec plusieurs instances, utiliser un stockage commun.
const refreshes = new Map();
const REFRESH_REUSE_MS = 60000;

// Jetons valides, renouvelés si nécessaire. OAuthError si le serveur refuse : la session doit être fermée.
export async function freshTokens(tokens) {
  if (Date.now() < tokens.refreshAt) return tokens;

  const old = tokens.refreshToken;
  if (!refreshes.has(old)) {
    const promise = tokenRequest({ grant_type: 'refresh_token', refresh_token: old }).then(
      forSession
    );
    refreshes.set(old, promise);
    promise.then(
      () => setTimeout(() => refreshes.delete(old), REFRESH_REUSE_MS).unref(),
      () => refreshes.delete(old)
    );
  }
  return refreshes.get(old);
}

//
// 3. Back-channel logout (OpenID Connect Back-Channel Logout 1.0)
//

// Vérifie un logout token et renvoie l'uid de l'utilisateur à déconnecter
export function verifyLogoutToken(logoutToken) {
  const claims = jwt.verify(logoutToken, config.oauth.publicKey, {
    algorithms: ['RS256'],
    audience: config.oauth.clientId,
    issuer: config.oauth.issuer,
    clockTolerance: 60,
  });
  for (const claim of ['iat', 'exp', 'jti', 'events', 'uid']) {
    if (claims[claim] === undefined) throw new OAuthError(`Logout token without ${claim}`);
  }
  const event = claims.events?.[LOGOUT_EVENT];
  if (typeof event !== 'object' || event === null || 'nonce' in claims) {
    throw new OAuthError('Not a logout token');
  }
  if (Math.abs(Date.now() / 1000 - claims.iat) > 300) throw new OAuthError('Logout token too old');
  if (!UUID_PATTERN.test(String(claims.uid))) throw new OAuthError('Invalid uid');
  return String(claims.uid).toLowerCase();
}

// Toutes les sessions de cet utilisateur ouvertes avant maintenant deviennent invalides
export async function markRevoked(ssoId) {
  await OAuthRevocation.upsert({ ssoId, revokedAt: Date.now() });
}

export async function isRevoked(ssoId, loggedInAt) {
  const revocation = await OAuthRevocation.findByPk(ssoId);
  return !!revocation && loggedInAt <= Number(revocation.revokedAt);
}
