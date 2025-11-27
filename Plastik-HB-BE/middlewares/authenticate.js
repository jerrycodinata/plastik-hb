"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Session_1 = require("../models/Session");
const middlewareWrapper_1 = require("../utils/middlewareWrapper");
/**
 * @desc Middleware to authenticate session tokens
 */
const authenticate = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    if (!token) {
        const error = new Error('Unauthorized: No session token provided.');
        error.statusCode = 401;
        throw error;
    }
    const session = await Session_1.Session.findOne({ where: { token } });
    if (!session || new Date() > session.expires_at) {
        const error = new Error('Unauthorized: Invalid or expired session token.');
        error.statusCode = 401;
        throw error;
    }
    if (new Date() > session.expires_at) {
        // Clean up expired session
        await session.destroy();
        const error = new Error('Unauthorized: Session token has expired.');
        error.statusCode = 401;
        throw error;
    }
    // Attach session info to request for potential use in controllers
    req.session = session;
};
exports.default = (0, middlewareWrapper_1.middlewareWrapper)(authenticate);
