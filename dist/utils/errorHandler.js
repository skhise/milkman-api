"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.ApiError = void 0;
class ApiError extends Error {
    constructor(message, statusCode = 500, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
    }
}
exports.ApiError = ApiError;
const errorHandler = (err, _req, res, _next) => {
    // Handle case where err might not be an Error instance
    let error;
    if (err instanceof Error) {
        error = err;
    }
    else if (err && typeof err === 'object' && 'message' in err) {
        error = err;
    }
    else {
        error = new Error(String(err || 'Unknown error'));
    }
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    const payload = {
        message: error.message || 'Internal server error',
        ...(error instanceof ApiError && error.details ? { details: error.details } : {}),
    };
    if (process.env.NODE_ENV !== 'production') {
        console.error('Error:', error.message);
        if (error.stack) {
            console.error('Stack:', error.stack);
        }
    }
    res.status(statusCode).json(payload);
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map