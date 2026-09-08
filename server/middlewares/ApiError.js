const mongoose = require('mongoose');
class ApiError extends Error {
    constructor(statusCode,message) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
    }
}

const handleError = (err, res) => {
    const {statusCode, message} = err;
    res.status(statusCode).json({
        status: 'error',
        statusCode: statusCode,
        message: message
    })
};

const convertToApiError = (err, req, res, next) => {
    let error = err;
    const statusCode = error.statusCode || (error instanceof mongoose.Error ? 400 : 500);
    const message = error.message || 'Internal Server Error';

    if(!(error instanceof ApiError)) {
        error = new ApiError(statusCode, message);
    }
    next(error);
}

module.exports = {ApiError, handleError, convertToApiError};
