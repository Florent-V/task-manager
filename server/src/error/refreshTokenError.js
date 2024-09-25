class RefreshTokenError extends Error {
  constructor(message) {
      super(message);
      this.name = 'RefreshTokenError';
      this.status = 401;
  }
}

export default RefreshTokenError;
