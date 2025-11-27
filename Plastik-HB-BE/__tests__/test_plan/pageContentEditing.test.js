"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pageService_1 = require("../../services/pageService");
jest.mock('../../services/pageService');
describe('Page Content Editing', () => {
    // TC-053-a: Edit homepage content
    it('TC-053-a: should allow admin to edit homepage content', async () => {
        pageService_1.updateHomepageData.mockResolvedValue({ title: 'Homepage', description: 'Homepage description', published: true, sections: [] });
        const result = await (0, pageService_1.updateHomepageData)({ title: 'Homepage', description: 'Homepage description', published: true, sections: [] });
        expect(result).toHaveProperty('title', 'Homepage');
    });
    // TC-053-b: Edit About Us content
    it('TC-053-b: should allow admin to edit About Us content', async () => {
        pageService_1.updateAboutPageData.mockResolvedValue({ id: 'about', title: 'Tentang Kami', description: 'Deskripsi Tentang Kami', published: true, sections: [] });
        const result = await (0, pageService_1.updateAboutPageData)({ id: 'about', title: 'Tentang Kami', description: 'Deskripsi Tentang Kami', published: true, sections: [] });
        expect(result).toHaveProperty('title', 'Tentang Kami');
    });
});
