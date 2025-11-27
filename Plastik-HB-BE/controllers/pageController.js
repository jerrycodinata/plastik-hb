"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAboutPage = exports.updateHomepage = exports.getPage = void 0;
const pageService_1 = require("../services/pageService");
/**
 * @desc Fetch page data by slug
 * @route GET /pages/:slug
 */
const getPage = async (req, res) => {
    const { slug } = req.params;
    // Validate input
    if (!slug) {
        throw { message: 'Slug is required.', status: 400 };
    }
    // Delegate to service layer
    const pageData = await (0, pageService_1.getPageBySlug)(slug);
    return { data: pageData, status: 200 };
};
exports.getPage = getPage;
/**
 * @desc Update homepage data
 * @route PUT /homepage
 */
const updateHomepage = async (req, res) => {
    try {
        const { title, description, published, sections } = req.body;
        if (!title || !sections) {
            return res.status(400).json({ message: 'Title and sections are required.' });
        }
        // Delegate to service layer (implement updateHomepageData in pageService)
        const updatedHomepage = await (0, pageService_1.updateHomepageData)({ title, description, published, sections });
        return res.status(200).json({ message: 'Homepage updated', data: updatedHomepage });
    }
    catch (err) {
        return res.status(500).json({ message: 'Server error', error: err.message || err });
    }
};
exports.updateHomepage = updateHomepage;
/**
 * @desc Update About Page data
 * @route PUT /pages/:id
 */
const updateAboutPage = async (req, res) => {
    try {
        const { id, title, description, published, sections } = req.body;
        // --- Input Validation ---
        if (!id || !title || !sections) {
            return res.status(400).json({ message: 'ID, title, and sections are required.' });
        }
        // --- Delegate to Service Layer ---
        const updatedPage = await (0, pageService_1.updateAboutPageData)({
            id,
            title,
            description,
            published,
            sections,
        });
        // --- Success Response ---
        return res.status(200).json({ message: 'About page updated', data: updatedPage });
    }
    catch (err) {
        // --- Error Handling ---
        return res.status(500).json({ message: 'Server error', error: err.message || err });
    }
};
exports.updateAboutPage = updateAboutPage;
