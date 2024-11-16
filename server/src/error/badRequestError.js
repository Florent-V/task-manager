class BadRequestError extends Error {
    constructor(message = 'Bad Request', errors = []) {
        super(message);
        this.name = 'BadRequestError';
        this.status = 400;
        this.errors = errors;
    }
}

export default BadRequestError;