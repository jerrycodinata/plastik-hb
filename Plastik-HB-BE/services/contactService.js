"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateContactSection = exports.getContactSection = void 0;
const Section_1 = require("../models/Section");
/**
 * @desc Fetch contact info section (type: ADDRESS)
 * @returns Contact section or null
 */
const getContactSection = async () => {
    try {
        return await Section_1.Section.findOne({
            where: { type: 'ADDRESS' },
        });
    }
    catch (error) {
        console.error('Error fetching contact section:', error);
        throw new Error('Failed to retrieve contact information');
    }
};
exports.getContactSection = getContactSection;
/**
 * @desc Update contact info section (type: ADDRESS)
 * @param data - Contact information object
 * @returns Updated section
 */
const updateContactSection = async (data) => {
    try {
        let section = await Section_1.Section.findOne({ where: { type: 'ADDRESS' } });
        if (!section) {
            throw new Error('Contact section not found');
        }
        section.data = data;
        await section.save();
        return section;
    }
    catch (error) {
        console.error('Error updating contact section:', error);
        // Pass through known error, otherwise throw generic
        if (error.message === 'Contact section not found') {
            throw error;
        }
        throw new Error('Failed to update contact information');
    }
};
exports.updateContactSection = updateContactSection;
