"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = exports.logoutUser = exports.loginUser = void 0;
const authenticationService_1 = require("../services/authenticationService");
/**
 * @desc Handles user login
 * @route POST /login
 */
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    // Validate input (basic validation, can be extended)
    if (!email || !password) {
        throw { message: 'Email and password are required.', status: 400 };
    }
    // Delegate to service layer
    const token = await (0, authenticationService_1.login)(email, password);
    return { token, status: 200 };
};
exports.loginUser = loginUser;
/**
 * @desc Handles user logout
 * @route POST /logout
 */
const logoutUser = async (req, res) => {
    const { token } = req.body;
    // Validate input
    if (!token) {
        // return { message: 'Token is required.', status: 400 };
        throw { message: 'Token is required.', status: 400 };
    }
    // Delegate to service layer
    await (0, authenticationService_1.logout)(token);
    return { message: 'Logout successful', status: 200 };
};
exports.logoutUser = logoutUser;
/**
 * @desc Handles session verification
 * @route POST /verify-session
 */
const verify = async (req, res) => {
    const { token } = req.body;
    // Validate input
    if (!token) {
        throw { message: 'Token is required.', status: 400 };
    }
    // Delegate to service layer
    await (0, authenticationService_1.verifySession)(token);
    return { message: 'Session is valid', status: 200 };
};
exports.verify = verify;
