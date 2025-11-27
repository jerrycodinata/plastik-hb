"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAboutPageData = exports.updateBannerInSection = exports.deleteBannerImage = exports.updateHomepageData = exports.getPageBySlug = exports.upload = void 0;
const Page_1 = require("../models/Page");
const Section_1 = require("../models/Section");
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/banners';
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const filename = `banner-${Date.now()}-${file.originalname}`;
        cb(null, filename);
    },
});
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        // Allow common image formats: PNG, JPG, JPEG
        const allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Only PNG, JPG, and JPEG image files are allowed'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});
/**
 * @desc Fetch page data by slug
 * @param slug - Page slug
 * @returns Page data with sections
 */
const getPageBySlug = async (slug) => {
    console.log(`Fetching page with slug: ${slug}`);
    const page = await Page_1.Page.findOne({
        where: { slug },
        include: [{
                model: Section_1.Section,
                as: 'sections',
                required: false,
            }],
        order: [[{ model: Section_1.Section, as: 'sections' }, 'order', 'ASC']],
    });
    if (!page) {
        throw new Error(`Page with slug '${slug}' not found.`);
    }
    console.log(`Page found successfully: ${page.title}`);
    return page;
};
exports.getPageBySlug = getPageBySlug;
/**
 * @desc Update homepage data and its sections with banner image support
 * @param data - Homepage data (title, description, published, sections)
 * @param bannerFile - Optional banner image file
 * @returns Updated homepage with sections
 */
const updateHomepageData = async ({ title, description, published, sections }, bannerFile) => {
    // Find homepage by slug
    const homepage = await Page_1.Page.findOne({
        where: { slug: 'homepage' },
        include: [{ model: Section_1.Section, as: 'sections' }],
    });
    if (!homepage)
        throw new Error('Homepage not found');
    // Update main fields
    homepage.title = title;
    homepage.description = description;
    homepage.published = published;
    await homepage.save();
    // Update sections with banner image handling
    const homepageSections = homepage.sections || [];
    for (const sectionData of sections) {
        let section = homepageSections.find((s) => s.id === sectionData.id);
        // Handle banner image upload for banner carousel sections
        if (sectionData.type === 'banner_carousel' && bannerFile) {
            const baseUrl = '/uploads/banners/';
            const bannerImageUrl = `${baseUrl}${bannerFile.filename}`;
            // Update section data with new banner image
            if (sectionData.data && sectionData.data.banners) {
                sectionData.data.banners = sectionData.data.banners.map((banner) => ({
                    ...banner,
                    image: bannerImageUrl,
                }));
            }
        }
        if (section) {
            section.data = sectionData.data;
            section.order = sectionData.order;
            section.visible = sectionData.visible;
            await section.save();
        }
        else {
            // Create new section if not found
            await Section_1.Section.create({
                page_id: homepage.id,
                type: sectionData.type,
                data: sectionData.data,
                order: sectionData.order,
                visible: sectionData.visible,
            });
        }
    }
    // Reload homepage with updated sections
    const updatedHomepage = await Page_1.Page.findOne({
        where: { slug: 'homepage' },
        include: [{ model: Section_1.Section, as: 'sections' }],
        order: [[{ model: Section_1.Section, as: 'sections' }, 'order', 'ASC']],
    });
    if (!updatedHomepage)
        throw new Error('Homepage not found after update');
    return updatedHomepage;
};
exports.updateHomepageData = updateHomepageData;
/**
 * @desc Delete banner image file
 * @param imagePath - Path to the image file
 */
const deleteBannerImage = async (imagePath) => {
    try {
        const fullPath = path_1.default.join(process.cwd(), imagePath);
        if (fs_1.default.existsSync(fullPath)) {
            fs_1.default.unlinkSync(fullPath);
        }
    }
    catch (error) {
        console.error('Error deleting banner image:', error);
    }
};
exports.deleteBannerImage = deleteBannerImage;
/**
 * @desc Update specific banner in a carousel section
 * @param sectionId - Section ID
 * @param bannerIndex - Index of banner to update
 * @param bannerData - Banner data (title, subtitle, buttonText, buttonLink)
 * @param bannerFile - Optional new banner image
 */
const updateBannerInSection = async (sectionId, bannerIndex, bannerData, bannerFile) => {
    const section = await Section_1.Section.findByPk(sectionId);
    if (!section)
        throw new Error('Section not found');
    const sectionDataObj = section.data;
    if (!sectionDataObj.banners || !sectionDataObj.banners[bannerIndex]) {
        throw new Error('Banner not found at specified index');
    }
    // Update banner data
    const banner = sectionDataObj.banners[bannerIndex];
    if (bannerData.title !== undefined)
        banner.title = bannerData.title;
    if (bannerData.subtitle !== undefined)
        banner.subtitle = bannerData.subtitle;
    if (bannerData.buttonText !== undefined)
        banner.buttonText = bannerData.buttonText;
    if (bannerData.buttonLink !== undefined)
        banner.buttonLink = bannerData.buttonLink;
    // Update banner image if provided
    if (bannerFile) {
        // Delete old image if exists
        if (banner.image) {
            await (0, exports.deleteBannerImage)(banner.image);
        }
        const baseUrl = '/uploads/banners/';
        banner.image = `${baseUrl}${bannerFile.filename}`;
    }
    // Save updated section
    section.data = sectionDataObj;
    await section.save();
    return section;
};
exports.updateBannerInSection = updateBannerInSection;
/**
 * @desc Update About Page data and its sections
 * @param data - About page data (id, title, description, published, sections)
 * @returns Updated About Page with sections
 */
const updateAboutPageData = async ({ id, title, description, published, sections }) => {
    // --- Fetch Page ---
    const aboutPage = await Page_1.Page.findByPk(id, {
        include: [{ model: Section_1.Section, as: 'sections' }]
    });
    if (!aboutPage)
        throw new Error('About page not found');
    // --- Update Main Fields ---
    aboutPage.title = title;
    aboutPage.description = description;
    aboutPage.published = published;
    await aboutPage.save();
    // --- Update Sections ---
    const existingSections = aboutPage.sections || [];
    for (const sectionData of sections) {
        let section = existingSections.find((s) => s.id === sectionData.id);
        if (section) {
            section.data = sectionData.data;
            section.order = sectionData.order;
            section.visible = sectionData.visible;
            await section.save();
        }
        else {
            await Section_1.Section.create({
                page_id: aboutPage.id,
                type: sectionData.type,
                data: sectionData.data,
                order: sectionData.order,
                visible: sectionData.visible,
            });
        }
    }
    // --- Reload Updated Page ---
    const updatedAboutPage = await Page_1.Page.findByPk(id, {
        include: [{ model: Section_1.Section, as: 'sections' }],
        order: [[{ model: Section_1.Section, as: 'sections' }, 'order', 'ASC']],
    });
    if (!updatedAboutPage)
        throw new Error('About page not found after update');
    return updatedAboutPage;
};
exports.updateAboutPageData = updateAboutPageData;
