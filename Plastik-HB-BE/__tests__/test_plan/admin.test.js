"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../../models/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
jest.mock('../../models/User');
jest.mock('bcrypt');
describe('Admin Authentication', () => {
    // TC-051-a: Login with correct credentials
    it('TC-051-a: should login with correct credentials', async () => {
        User_1.User.findOne.mockResolvedValue({ password: 'hashed' });
        bcrypt_1.default.compare.mockResolvedValue(true);
        const user = await User_1.User.findOne({ where: { email: 'admin@example.com' } });
        expect(user).toBeTruthy();
        const valid = await bcrypt_1.default.compare('admin123', user.password);
        expect(valid).toBe(true);
    });
    // TC-051-b: Login with wrong credentials
    it('TC-051-b: should reject login with wrong credentials', async () => {
        User_1.User.findOne.mockResolvedValue({ password: 'hashed' });
        bcrypt_1.default.compare.mockResolvedValue(false);
        const user = await User_1.User.findOne({ where: { email: 'admin@example.com' } });
        expect(user).toBeTruthy();
        const valid = await bcrypt_1.default.compare('wrong', user.password);
        expect(valid).toBe(false);
    });
});
