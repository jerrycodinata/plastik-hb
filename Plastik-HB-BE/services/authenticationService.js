"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySession = exports.logout = exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const User_1 = require("../models/User");
const Session_1 = require("../models/Session");
/**
 * @desc Handles user login logic
 * @param email - User's email
 * @param password - User's password
 * @returns Session token
 */
const login = async (email, password) => {
    const user = await User_1.User.findOne({ where: { email } });
    if (!user) {
        const error = new Error('Invalid email or password.');
        error.statusCode = 401;
        throw error;
    }
    const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        const error = new Error('Invalid email or password.');
        error.statusCode = 401;
        throw error;
    }
    // Create a new session
    const session = await Session_1.Session.create({
        token: generateSessionToken(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000 * 7), // 7 days expiration
    });
    return session.token;
};
exports.login = login;
/**
 * @desc Handles user logout logic
 * @param token - Session token to invalidate
 */
const logout = async (token) => {
    const session = await Session_1.Session.findOne({ where: { token } });
    if (!session) {
        throw new Error('Invalid session token.');
    }
    // Delete the session
    await session.destroy();
};
exports.logout = logout;
/**
 * @desc Verifies if a session token is valid
 * @param token - Session token to verify
 * @returns Boolean indicating validity
 */
const verifySession = async (token) => {
    const session = await Session_1.Session.findOne({ where: { token } });
    if (!session) {
        throw new Error('Invalid session token.');
    }
    if (new Date() > session.expires_at) {
        throw new Error('Session token has expired.');
    }
    return true; // Session is valid
};
exports.verifySession = verifySession;
/**
 * @desc Generates a random session token
 * @returns Random session token
 */
const generateSessionToken = () => {
    return (0, uuid_1.v4)();
};
