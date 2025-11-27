"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authenticationService_1 = require("../../services/authenticationService");
const User_1 = require("../../models/User");
const Session_1 = require("../../models/Session");
const bcrypt_1 = __importDefault(require("bcrypt"));
// Mock dependencies
jest.mock('../../models/User');
jest.mock('../../models/Session');
jest.mock('bcrypt');
jest.mock('uuid', () => ({
    v4: jest.fn(() => 'mock-uuid-token')
}));
const mockedUser = User_1.User;
const mockedSession = Session_1.Session;
const mockedBcrypt = bcrypt_1.default;
describe('Authentication Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('login', () => {
        it('should login successfully with valid credentials', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                password: 'hashedPassword'
            };
            const mockSession = {
                token: 'mock-uuid-token',
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000 * 7)
            };
            mockedUser.findOne.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(true);
            mockedSession.create.mockResolvedValue(mockSession);
            const result = await (0, authenticationService_1.login)('test@example.com', 'password123');
            expect(mockedUser.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
            expect(mockedBcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
            expect(mockedSession.create).toHaveBeenCalledWith({
                token: 'mock-uuid-token',
                expires_at: expect.any(Date)
            });
            expect(result).toBe('mock-uuid-token');
        });
        it('should throw error when user not found', async () => {
            mockedUser.findOne.mockResolvedValue(null);
            await expect((0, authenticationService_1.login)('nonexistent@example.com', 'password123'))
                .rejects.toThrow('Invalid email or password.');
            expect(mockedUser.findOne).toHaveBeenCalledWith({ where: { email: 'nonexistent@example.com' } });
            expect(mockedBcrypt.compare).not.toHaveBeenCalled();
            expect(mockedSession.create).not.toHaveBeenCalled();
        });
        it('should throw error when password is invalid', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                password: 'hashedPassword'
            };
            mockedUser.findOne.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(false);
            await expect((0, authenticationService_1.login)('test@example.com', 'wrongpassword'))
                .rejects.toThrow('Invalid email or password.');
            expect(mockedUser.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
            expect(mockedBcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedPassword');
            expect(mockedSession.create).not.toHaveBeenCalled();
        });
    });
    describe('logout', () => {
        it('should logout successfully with valid token', async () => {
            const mockSession = {
                token: 'valid-token',
                destroy: jest.fn().mockResolvedValue(undefined)
            };
            mockedSession.findOne.mockResolvedValue(mockSession);
            await (0, authenticationService_1.logout)('valid-token');
            expect(mockedSession.findOne).toHaveBeenCalledWith({ where: { token: 'valid-token' } });
            expect(mockSession.destroy).toHaveBeenCalled();
        });
        it('should throw error when session not found', async () => {
            mockedSession.findOne.mockResolvedValue(null);
            await expect((0, authenticationService_1.logout)('invalid-token'))
                .rejects.toThrow('Invalid session token.');
            expect(mockedSession.findOne).toHaveBeenCalledWith({ where: { token: 'invalid-token' } });
        });
    });
    describe('verifySession', () => {
        it('should return true for valid non-expired session', async () => {
            const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
            const mockSession = {
                token: 'valid-token',
                expires_at: futureDate
            };
            mockedSession.findOne.mockResolvedValue(mockSession);
            const result = await (0, authenticationService_1.verifySession)('valid-token');
            expect(mockedSession.findOne).toHaveBeenCalledWith({ where: { token: 'valid-token' } });
            expect(result).toBe(true);
        });
        it('should throw error when session not found', async () => {
            mockedSession.findOne.mockResolvedValue(null);
            await expect((0, authenticationService_1.verifySession)('invalid-token'))
                .rejects.toThrow('Invalid session token.');
            expect(mockedSession.findOne).toHaveBeenCalledWith({ where: { token: 'invalid-token' } });
        });
        it('should throw error when session is expired', async () => {
            const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const mockSession = {
                token: 'expired-token',
                expires_at: pastDate
            };
            mockedSession.findOne.mockResolvedValue(mockSession);
            await expect((0, authenticationService_1.verifySession)('expired-token'))
                .rejects.toThrow('Session token has expired.');
            expect(mockedSession.findOne).toHaveBeenCalledWith({ where: { token: 'expired-token' } });
        });
    });
});
