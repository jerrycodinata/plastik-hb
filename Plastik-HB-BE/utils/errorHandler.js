"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
/**
 * @desc Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log the error for debugging
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({ error: message });
};
exports.errorHandler = errorHandler;
