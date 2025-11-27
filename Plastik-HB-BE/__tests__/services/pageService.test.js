"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pageService_1 = require("../../services/pageService");
const Page_1 = require("../../models/Page");
const Section_1 = require("../../models/Section");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Mock dependencies
jest.mock('../../models/Page');
jest.mock('../../models/Section');
jest.mock('fs');
jest.mock('path');
const mockedPage = Page_1.Page;
const mockedSection = Section_1.Section;
const mockedFs = fs_1.default;
const mockedPath = path_1.default;
describe('Page Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('getPageBySlug', () => {
        it('should return page with sections when found', async () => {
            const mockPage = {
                id: '1',
                slug: 'homepage',
                title: 'Home Page',
                sections: [
                    { id: '1', type: 'hero', order: 1 },
                    { id: '2', type: 'about', order: 2 }
                ]
            };
            mockedPage.findOne.mockResolvedValue(mockPage);
            const result = await (0, pageService_1.getPageBySlug)('homepage');
            expect(mockedPage.findOne).toHaveBeenCalledWith({
                where: { slug: 'homepage' },
                include: [{
                        model: Section_1.Section,
                        as: 'sections',
                        required: false,
                    }],
                order: [[{ model: Section_1.Section, as: 'sections' }, 'order', 'ASC']],
            });
            expect(result).toEqual(mockPage);
        });
        it('should throw error when page not found', async () => {
            mockedPage.findOne.mockResolvedValue(null);
            await expect((0, pageService_1.getPageBySlug)('nonexistent'))
                .rejects.toThrow("Page with slug 'nonexistent' not found.");
        });
    });
    describe('updateHomepageData', () => {
        it('should update homepage without banner file', async () => {
            const mockHomepage = {
                id: '1',
                slug: 'homepage',
                title: 'Old Title',
                description: 'Old Description',
                published: false,
                sections: [],
                save: jest.fn().mockResolvedValue(undefined)
            };
            const updateData = {
                title: 'New Title',
                description: 'New Description',
                published: true,
                sections: [
                    {
                        id: '1',
                        type: 'hero',
                        data: { title: 'Hero Section' },
                        order: 1,
                        visible: true
                    }
                ]
            };
            mockedPage.findOne
                .mockResolvedValueOnce(mockHomepage)
                .mockResolvedValueOnce({ ...mockHomepage, ...updateData });
            const result = await (0, pageService_1.updateHomepageData)(updateData);
            expect(mockHomepage.save).toHaveBeenCalled();
            expect(mockHomepage.title).toBe('New Title');
            expect(mockHomepage.description).toBe('New Description');
            expect(mockHomepage.published).toBe(true);
        });
        it('should update homepage with banner file', async () => {
            const mockHomepage = {
                id: '1',
                slug: 'homepage',
                sections: [{
                        id: '1',
                        type: 'banner_carousel',
                        data: { banners: [{ title: 'Banner 1' }] },
                        save: jest.fn().mockResolvedValue(undefined)
                    }],
                save: jest.fn().mockResolvedValue(undefined)
            };
            const bannerFile = {
                filename: 'banner-123.jpg'
            };
            const updateData = {
                title: 'Homepage',
                description: 'Description',
                published: true,
                sections: [
                    {
                        id: '1',
                        type: 'banner_carousel',
                        data: {
                            banners: [{ title: 'Updated Banner' }]
                        },
                        order: 1,
                        visible: true
                    }
                ]
            };
            mockedPage.findOne
                .mockResolvedValueOnce(mockHomepage)
                .mockResolvedValueOnce(mockHomepage);
            await (0, pageService_1.updateHomepageData)(updateData, bannerFile);
            expect(mockHomepage.save).toHaveBeenCalled();
        });
        it('should throw error when homepage not found', async () => {
            mockedPage.findOne.mockResolvedValue(null);
            const updateData = {
                title: 'Title',
                description: 'Description',
                published: true,
                sections: []
            };
            await expect((0, pageService_1.updateHomepageData)(updateData))
                .rejects.toThrow('Homepage not found');
        });
    });
    describe('deleteBannerImage', () => {
        it('should delete banner image file when it exists', async () => {
            const imagePath = '/uploads/banners/banner-123.jpg';
            const fullPath = '/full/path/to/banner-123.jpg';
            mockedPath.join.mockReturnValue(fullPath);
            mockedFs.existsSync.mockReturnValue(true);
            mockedFs.unlinkSync.mockImplementation(() => { });
            await (0, pageService_1.deleteBannerImage)(imagePath);
            expect(mockedPath.join).toHaveBeenCalledWith(process.cwd(), imagePath);
            expect(mockedFs.existsSync).toHaveBeenCalledWith(fullPath);
            expect(mockedFs.unlinkSync).toHaveBeenCalledWith(fullPath);
        });
        it('should not throw error when file does not exist', async () => {
            const imagePath = '/uploads/banners/nonexistent.jpg';
            const fullPath = '/full/path/to/nonexistent.jpg';
            mockedPath.join.mockReturnValue(fullPath);
            mockedFs.existsSync.mockReturnValue(false);
            await expect((0, pageService_1.deleteBannerImage)(imagePath)).resolves.not.toThrow();
            expect(mockedFs.unlinkSync).not.toHaveBeenCalled();
        });
        it('should handle file deletion errors gracefully', async () => {
            const imagePath = '/uploads/banners/banner-123.jpg';
            const fullPath = '/full/path/to/banner-123.jpg';
            mockedPath.join.mockReturnValue(fullPath);
            mockedFs.existsSync.mockReturnValue(true);
            mockedFs.unlinkSync.mockImplementation(() => {
                throw new Error('File deletion failed');
            });
            // Should not throw error, just log it
            await expect((0, pageService_1.deleteBannerImage)(imagePath)).resolves.not.toThrow();
        });
    });
    describe('updateBannerInSection', () => {
        it('should update banner data without new image', async () => {
            const mockSection = {
                id: '1',
                data: {
                    banners: [
                        { title: 'Old Title', subtitle: 'Old Subtitle' }
                    ]
                },
                save: jest.fn().mockResolvedValue(undefined)
            };
            mockedSection.findByPk.mockResolvedValue(mockSection);
            const bannerData = {
                title: 'New Title',
                subtitle: 'New Subtitle'
            };
            const result = await (0, pageService_1.updateBannerInSection)('1', 0, bannerData);
            expect(mockSection.data.banners[0].title).toBe('New Title');
            expect(mockSection.data.banners[0].subtitle).toBe('New Subtitle');
            expect(mockSection.save).toHaveBeenCalled();
            expect(result).toEqual(mockSection);
        });
        it('should update banner with new image file', async () => {
            const mockSection = {
                id: '1',
                data: {
                    banners: [
                        { title: 'Title', image: '/old-image.jpg' }
                    ]
                },
                save: jest.fn().mockResolvedValue(undefined)
            };
            const bannerFile = {
                filename: 'new-banner-123.jpg'
            };
            mockedSection.findByPk.mockResolvedValue(mockSection);
            const result = await (0, pageService_1.updateBannerInSection)('1', 0, {}, bannerFile);
            expect(mockSection.data.banners[0].image).toBe('/uploads/banners/new-banner-123.jpg');
            expect(mockSection.save).toHaveBeenCalled();
        });
        it('should throw error when section not found', async () => {
            mockedSection.findByPk.mockResolvedValue(null);
            await expect((0, pageService_1.updateBannerInSection)('999', 0, {}))
                .rejects.toThrow('Section not found');
        });
        it('should throw error when banner index is invalid', async () => {
            const mockSection = {
                id: '1',
                data: { banners: [{ title: 'Banner 1' }] }
            };
            mockedSection.findByPk.mockResolvedValue(mockSection);
            await expect((0, pageService_1.updateBannerInSection)('1', 5, {}))
                .rejects.toThrow('Banner not found at specified index');
        });
    });
    describe('updateAboutPageData', () => {
        it('should update about page successfully', async () => {
            const mockAboutPage = {
                id: '1',
                title: 'Old About',
                description: 'Old Description',
                published: false,
                sections: [],
                save: jest.fn().mockResolvedValue(undefined)
            };
            const updateData = {
                id: '1',
                title: 'New About',
                description: 'New Description',
                published: true,
                sections: [
                    {
                        id: '1',
                        type: 'content',
                        data: { content: 'About content' },
                        order: 1,
                        visible: true
                    }
                ]
            };
            mockedPage.findByPk
                .mockResolvedValueOnce(mockAboutPage)
                .mockResolvedValueOnce({ ...mockAboutPage, ...updateData });
            const result = await (0, pageService_1.updateAboutPageData)(updateData);
            expect(mockAboutPage.save).toHaveBeenCalled();
            expect(mockAboutPage.title).toBe('New About');
            expect(mockAboutPage.description).toBe('New Description');
            expect(mockAboutPage.published).toBe(true);
        });
        it('should throw error when about page not found', async () => {
            mockedPage.findByPk.mockResolvedValue(null);
            const updateData = {
                id: '999',
                title: 'About',
                description: 'Description',
                published: true,
                sections: []
            };
            await expect((0, pageService_1.updateAboutPageData)(updateData))
                .rejects.toThrow('About page not found');
        });
    });
});
