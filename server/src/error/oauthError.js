// Refus du serveur OAuth2 (code invalide, accès retiré, compte bloqué…) ou réponse inattendue
class OAuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'OAuthError';
    this.status = 401;
  }
}

export default OAuthError;
