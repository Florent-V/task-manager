class BadRequestError extends Error {
  constructor(message = 'Bad Request') {
      super(message);
      this.name = 'BadRequestError';
      this.status = 400;
  }
}

export default BadRequestError;
