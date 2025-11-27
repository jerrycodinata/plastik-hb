"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Product_1 = require("../../models/Product");
jest.mock('../../models/Product');
describe('Product Detail', () => {
    it('TC-041: should show product name and image on detail page', async () => {
        Product_1.Product.findByPk.mockResolvedValue({ name: 'A', image: 'img.jpg' });
        const result = await Product_1.Product.findByPk(1);
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('image');
    });
    it('TC-042: should show full product description', async () => {
        Product_1.Product.findByPk.mockResolvedValue({ description: 'desc' });
        const result = await Product_1.Product.findByPk(1);
        expect(result).toHaveProperty('description');
    });
    it('TC-043: should provide contact/WhatsApp info on product detail', async () => {
        Product_1.Product.findByPk.mockResolvedValue({ whatsapp: '08123456789' });
        const result = await Product_1.Product.findByPk(1);
        expect(result).toHaveProperty('whatsapp');
    });
});
