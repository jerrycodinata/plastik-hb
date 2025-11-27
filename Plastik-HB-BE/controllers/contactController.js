"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.putContactInfo = exports.getContactInfo = void 0;
const contactService_1 = require("../services/contactService");
/**
 * GET /contact-info
 */
const getContactInfo = async (req, res) => {
    const section = await (0, contactService_1.getContactSection)();
    if (!section)
        throw { message: 'Contact info not found', status: 404 };
    return { data: section.data, status: 200 };
};
exports.getContactInfo = getContactInfo;
/**
 * PUT /contact-info
 */
const putContactInfo = async (req, res) => {
    const { data } = req.body;
    if (!data)
        throw { message: 'Missing contact info data', status: 400 };
    const section = await (0, contactService_1.updateContactSection)(data);
    return { data: section.data, status: 200 };
};
exports.putContactInfo = putContactInfo;
