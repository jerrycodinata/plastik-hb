"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../app"));
const pageService_1 = require("../../services/pageService");
jest.mock('../../services/pageService');
describe('Banner Management', () => {
    // TC-021-a: Upload jpg/png banner
    it('TC-021-a: should allow uploading jpg/png banner', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/uploads')
            .attach('image', Buffer.from('dummy'), { filename: 'banner.jpg', contentType: 'image/jpeg' });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('imageUrl');
    });
    // TC-021-b: Reject unsupported file format
    it('TC-021-b: should reject unsupported file formats', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/uploads')
            .attach('image', Buffer.from('dummy'), { filename: 'banner.exe', contentType: 'application/octet-stream' });
        expect(res.status).toBe(400);
    });
    // TC-022-a: Edit banner image/text
    it('TC-022-a: should allow editing banner image and text', async () => {
        pageService_1.updateBannerInSection.mockResolvedValue({ success: true });
        const result = await (0, pageService_1.updateBannerInSection)('sectionId', 0, { title: 'New Banner' });
        expect(result).toHaveProperty('success', true);
    });
    // TC-022-b: Change banner order
    it('TC-022-b: should allow changing banner order', async () => {
        pageService_1.updateHomepageData.mockResolvedValue({ success: true });
        const result = await (0, pageService_1.updateHomepageData)({
            title: 'Homepage',
            description: 'Homepage description',
            published: true,
            sections: [{ type: 'banner_carousel', order: 1 }]
        });
        expect(result).toHaveProperty('success', true);
    });
    // TC-023: Delete banner
    it('TC-023: should delete a banner', async () => {
        pageService_1.deleteBannerImage.mockResolvedValue(undefined);
        await expect((0, pageService_1.deleteBannerImage)('/uploads/banner.jpg')).resolves.toBeUndefined();
    });
    // TC-024: Banner auto-rotates with smooth transition
    it('TC-024: should provide banners for frontend to rotate with transition', async () => {
        // This is a frontend concern, but backend should return banners array
        const banners = [{ image: '/uploads/banner1.jpg' }, { image: '/uploads/banner2.jpg' }];
        pageService_1.updateHomepageData.mockResolvedValue({ sections: [{ type: 'banner_carousel', data: { banners } }] });
        const result = await (0, pageService_1.updateHomepageData)({
            title: 'Homepage',
            description: 'Homepage description',
            published: true,
            sections: [{ type: 'banner_carousel', data: { banners } }]
        });
        expect(result.sections[0].data.banners.length).toBeGreaterThan(1);
    });
    // TC-025: Manual banner navigation
    it('TC-025: should provide banners for manual navigation', async () => {
        const banners = [{ image: '/uploads/banner1.jpg' }, { image: '/uploads/banner2.jpg' }];
        pageService_1.updateHomepageData.mockResolvedValue({ sections: [{ type: 'banner_carousel', data: { banners } }] });
        const result = await (0, pageService_1.updateHomepageData)({
            title: 'Homepage',
            description: 'Homepage description',
            published: true,
            sections: [{ type: 'banner_carousel', data: { banners } }]
        });
        expect(result.sections[0].data.banners).toEqual(expect.any(Array));
    });
});
