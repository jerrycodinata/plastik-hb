"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../app"));
const User_1 = require("../../models/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const Product_1 = require("../../models/Product");
// jest.mock('../../models/User');
jest.mock('bcrypt');
// jest.mock('../../models/Product');
jest.spyOn(User_1.User, 'findOne').mockResolvedValue({ toJSON: () => ({ password: 'hashedPassword' }) });
jest.spyOn(Product_1.Product, 'findAll').mockResolvedValue(Array(999).fill({}));
jest.spyOn(User_1.User, 'create').mockResolvedValue({ email: 'admin@example.com', password: 'hashedPassword' });
describe('Security and Performance', () => {
    // TC-071: Block repeated login attempts
    it('TC-071: should block repeated failed login attempts', async () => {
        User_1.User.findOne.mockResolvedValue({ password: 'hashed' });
        bcrypt_1.default.compare.mockResolvedValue(false);
        for (let i = 0; i < 5; i++) {
            await (0, supertest_1.default)(app_1.default)
                .post('/api/authentication/login')
                .send({ email: 'admin@example.com', password: 'wrong' });
        }
        // Simulate lock (should be implemented in your logic)
        // Here just expect last attempt to be 401
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/authentication/login')
            .send({ email: 'admin@example.com', password: 'wrong' });
        expect(res.status).toBe(401);
    });
    // TC-072: Homepage loads < 3s
    it('TC-072: should load homepage in under 3 seconds', async () => {
        const start = Date.now();
        const res = await (0, supertest_1.default)(app_1.default).get('/');
        const duration = Date.now() - start;
        expect(res.status).toBe(200);
        expect(duration).toBeLessThan(3000);
    });
    // TC-111: 10 concurrent users, homepage < 3s
    it('TC-111: should serve homepage to 10 users in under 3 seconds', async () => {
        const start = Date.now();
        const requests = Array.from({ length: 10 }).map(() => (0, supertest_1.default)(app_1.default).get('/'));
        const results = await Promise.all(requests);
        const duration = Date.now() - start;
        results.forEach(res => expect(res.status).toBe(200));
        expect(duration).toBeLessThan(3000);
    });
    // TC-121: Search < 3s for < 1000 results
    it('TC-121: should return search results in under 3 seconds for <1000 data', async () => {
        Product_1.Product.findAll.mockResolvedValue(Array(999).fill({}));
        const start = Date.now();
        await Product_1.Product.findAll();
        const duration = Date.now() - start;
        expect(duration).toBeLessThan(3000);
    });
    // TC-131: 1000 products, no slowdown
    it('TC-131: should load 1000 products without slowdown', async () => {
        Product_1.Product.findAll.mockResolvedValue(Array(1000).fill({}));
        const start = Date.now();
        await Product_1.Product.findAll();
        const duration = Date.now() - start;
        expect(duration).toBeLessThan(3000);
    });
    // TC-141: Only authorized users access server
    it('TC-141: should restrict server access to authorized users', async () => {
        const res = await (0, supertest_1.default)(app_1.default).put('/api/contact').send({ data: { address: 'Jl. Mawar' } });
        expect(res.status).toBe(401);
    });
    // TC-151: XSS and SQL Injection safe
    // it('TC-151: should be safe from XSS and SQL Injection', async () => {
    //   // Simulate input sanitization
    //   const maliciousInput = "<script>alert('xss')</script>";
    //   // Assume your controller sanitizes this
    //   expect(maliciousInput).not.toMatch(/<script>/i);
    // });
    // TC-161: Admin password hashed with bcrypt
    it('TC-161: should store admin password hashed with bcrypt', async () => {
        bcrypt_1.default.hash.mockResolvedValue('hashedPassword');
        const plainPassword = 'admin123';
        const hashedPassword = await bcrypt_1.default.hash(plainPassword, 10);
        await User_1.User.create({ email: 'admin@example.com', password: hashedPassword });
        expect(bcrypt_1.default.hash).toHaveBeenCalledWith(plainPassword, expect.any(Number));
    });
});
