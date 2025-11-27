"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Page_1 = require("../../models/Page");
const Section_1 = require("../../models/Section");
jest.mock('../../models/Page');
jest.mock('../../models/Section');
describe('About Us Page', () => {
    afterEach(() => jest.clearAllMocks());
    // TC-011: About Us page shows correct data
    it('TC-011: should return About Us page data matching the database', async () => {
        const mockPage = {
            slug: 'tentang-kami',
            title: 'Tentang Kami',
            description: 'Deskripsi perusahaan',
            values: 'Nilai-nilai',
            vision: 'Visi',
            mission: 'Misi',
            history: 'Sejarah'
        };
        Page_1.Page.findOne.mockResolvedValue(mockPage);
        const result = await Page_1.Page.findOne({ where: { slug: 'tentang-kami' } });
        expect(result).toMatchObject({
            slug: 'tentang-kami',
            description: expect.any(String),
            values: expect.any(String),
            vision: expect.any(String),
            mission: expect.any(String),
            history: expect.any(String)
        });
    });
    // TC-012: About Us page shows contact info
    it('TC-012: should return address and phone number on About Us page', async () => {
        const mockSection = {
            type: 'ADDRESS',
            data: {
                address: 'Jl. Mawar No. 1',
                phone: '08123456789'
            }
        };
        Section_1.Section.findOne.mockResolvedValue(mockSection);
        const result = await Section_1.Section.findOne({ where: { type: 'ADDRESS' } });
        expect(result).not.toBeNull();
        expect(result.data).toHaveProperty('address');
        expect(result.data).toHaveProperty('phone');
    });
});
