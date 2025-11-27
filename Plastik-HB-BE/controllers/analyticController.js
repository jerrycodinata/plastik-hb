"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAnalytics = exports.getAnalytics = void 0;
const analyticService_1 = require("../services/analyticService");
const getAnalytics = async (req, res) => {
    const data = await (0, analyticService_1.getTrafficAnalytics)();
    return { data, status: 200 };
};
exports.getAnalytics = getAnalytics;
const addAnalytics = async (req, res) => {
    const { type, targetId, url } = req.body;
    if (!type || !targetId || !url) {
        throw { message: 'Type, targetId, and url are required.', status: 400 };
    }
    if (!(0, analyticService_1.isExist)(targetId)) {
        throw { message: 'Target ID does not exist.', status: 404 };
    }
    const ipAddress = req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
        req.socket.remoteAddress ||
        "-";
    const analytic = await (0, analyticService_1.createAnalytics)({
        type,
        targetId,
        url,
        ipAddress,
    });
    return { data: analytic, status: 201 };
};
exports.addAnalytics = addAnalytics;
