"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isExist = exports.createAnalytics = exports.getTrafficAnalytics = void 0;
const sequelize_1 = require("sequelize");
const Analytic_1 = require("../models/Analytic");
const axios_1 = __importDefault(require("axios"));
// Utility to format date as YYYY-MM-DD
const formatDate = (date) => date.toISOString().split('T')[0];
const getTrafficAnalytics = async () => {
    // --- Setup ---
    // Get all analytics for the last 30 days (adjust as needed)
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 29);
    const analytics = await Analytic_1.Analytic.findAll({
        where: {
            created_at: {
                [sequelize_1.Op.gte]: startDate,
                [sequelize_1.Op.lte]: today,
            },
        },
        // raw: false,
    });
    // --- Logic ---
    // Aggregate overall stats
    const uniqueVisitors = new Set(analytics.map(a => a.ipAddress)).size;
    const pageViews = analytics.filter(a => a.type === 'PAGE').length;
    const productClicks = analytics.filter(a => a.type === 'PRODUCT').length;
    // Aggregate clicks per product
    const clicksPerProduct = {};
    analytics
        .filter(a => a.type === 'PRODUCT' && a.targetId)
        .forEach(a => {
        const productId = a.targetId;
        const createdAt = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        if (!clicksPerProduct[productId]) {
            clicksPerProduct[productId] = { clicks: 1, lastClicked: createdAt.toISOString() };
        }
        else {
            clicksPerProduct[productId].clicks += 1;
            // Update lastClicked if this createdAt is newer
            if (!clicksPerProduct[productId].lastClicked ||
                createdAt > new Date(clicksPerProduct[productId].lastClicked)) {
                clicksPerProduct[productId].lastClicked = createdAt.toISOString();
            }
        }
    });
    // Aggregate timeline stats
    const timeline = {};
    for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateStr = formatDate(date);
        const dailyAnalytics = analytics.filter(a => {
            if (!a.createdAt) {
                return false;
            }
            const d = new Date(a.createdAt);
            return !isNaN(d.getTime()) && formatDate(d) === dateStr;
        });
        timeline[dateStr] = {
            pengunjung: new Set(dailyAnalytics.map(a => a.ipAddress)).size,
            pageViews: dailyAnalytics.filter(a => a.type === 'PAGE').length,
            productClicks: dailyAnalytics.filter(a => a.type === 'PRODUCT').length,
        };
    }
    // --- Response ---
    return {
        pengunjung: uniqueVisitors,
        pageViews,
        productClicks,
        clicksPerProduct,
        timeline,
    };
};
exports.getTrafficAnalytics = getTrafficAnalytics;
async function getCityFromIp(ip) {
    try {
        const res = await axios_1.default.get(`http://ip-api.com/json/${ip}/`);
        return res.data?.city ?? "Unknown";
    }
    catch (error) {
        return "Unknown";
    }
}
const createAnalytics = async (payload) => {
    const city = await getCityFromIp(payload.ipAddress);
    return await Analytic_1.Analytic.create({
        type: payload.type,
        targetId: payload.targetId,
        url: payload.url,
        ipAddress: payload.ipAddress,
        location: city,
    });
};
exports.createAnalytics = createAnalytics;
const isExist = async (targetId) => {
    let analytic;
    try {
        analytic = await Analytic_1.Analytic.findOne({ where: { targetId } });
    }
    catch (error) {
        return false;
    }
    return !!analytic;
};
exports.isExist = isExist;
