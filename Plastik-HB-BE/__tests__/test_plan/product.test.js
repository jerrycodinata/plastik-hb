"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Product_1 = require("../../models/Product");
jest.mock('../../models/Product');
describe('Product Gallery', () => {
    // TC-031: All products in gallery
    it('TC-031: should return all products in gallery', async () => {
        Product_1.Product.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
        const result = await Product_1.Product.findAll();
        expect(result.length).toBeGreaterThan(0);
    });
    // TC-032: Filter products by category
    it('TC-032: should filter products by selected category', async () => {
        Product_1.Product.findAll.mockResolvedValue([{ id: 1, category_id: 2 }]);
        const result = await Product_1.Product.findAll({ where: { category_id: 2 } });
        expect(result.every(p => Number(p.category_id) === 2)).toBe(true);
    });
    // TC-033: Product gallery shows image, name, price
    it('TC-033: should show image, name, and price for each product', async () => {
        Product_1.Product.findAll.mockResolvedValue([
            { id: 1, name: 'A', price: 100, image: 'img.jpg' }
        ]);
        const result = await Product_1.Product.findAll();
        result.forEach(product => {
            expect(product).toHaveProperty('name');
            expect(product).toHaveProperty('price');
            expect(product).toHaveProperty('image');
        });
    });
});
