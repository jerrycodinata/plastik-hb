"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const contactService_1 = require("../../services/contactService");
const Section_1 = require("../../models/Section");
// Mock dependencies
jest.mock('../../models/Section');
const mockedSection = Section_1.Section;
describe('Contact Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('getContactSection', () => {
        it('should return contact section when found', async () => {
            const mockContactSection = {
                id: '1',
                type: 'ADDRESS',
                data: {
                    address: '123 Main St',
                    phone: '+1234567890',
                    email: 'contact@example.com'
                }
            };
            mockedSection.findOne.mockResolvedValue(mockContactSection);
            const result = await (0, contactService_1.getContactSection)();
            expect(mockedSection.findOne).toHaveBeenCalledWith({
                where: { type: 'ADDRESS' }
            });
            expect(result).toEqual(mockContactSection);
        });
        it('should return null when contact section not found', async () => {
            mockedSection.findOne.mockResolvedValue(null);
            const result = await (0, contactService_1.getContactSection)();
            expect(result).toBeNull();
        });
        it('should throw error when database error occurs', async () => {
            const dbError = new Error('Database connection failed');
            mockedSection.findOne.mockRejectedValue(dbError);
            await expect((0, contactService_1.getContactSection)())
                .rejects.toThrow('Failed to retrieve contact information');
        });
    });
    describe('updateContactSection', () => {
        it('should update contact section successfully', async () => {
            const mockContactSection = {
                id: '1',
                type: 'ADDRESS',
                data: {
                    address: 'Old Address',
                    phone: 'Old Phone'
                },
                save: jest.fn().mockResolvedValue(undefined)
            };
            const newContactData = {
                address: 'New Address',
                phone: 'New Phone',
                email: 'new@example.com'
            };
            mockedSection.findOne.mockResolvedValue(mockContactSection);
            const result = await (0, contactService_1.updateContactSection)(newContactData);
            expect(mockedSection.findOne).toHaveBeenCalledWith({
                where: { type: 'ADDRESS' }
            });
            expect(mockContactSection.data).toEqual(newContactData);
            expect(mockContactSection.save).toHaveBeenCalled();
            expect(result).toEqual(mockContactSection);
        });
        it('should throw error when contact section not found', async () => {
            mockedSection.findOne.mockResolvedValue(null);
            const newContactData = {
                address: 'New Address',
                phone: 'New Phone'
            };
            await expect((0, contactService_1.updateContactSection)(newContactData))
                .rejects.toThrow('Contact section not found');
        });
        it('should throw error when database error occurs during update', async () => {
            const mockContactSection = {
                id: '1',
                type: 'ADDRESS',
                data: {},
                save: jest.fn().mockRejectedValue(new Error('Save failed'))
            };
            mockedSection.findOne.mockResolvedValue(mockContactSection);
            const newContactData = {
                address: 'New Address'
            };
            await expect((0, contactService_1.updateContactSection)(newContactData))
                .rejects.toThrow('Failed to update contact information');
        });
        it('should throw error when findOne fails', async () => {
            const dbError = new Error('Database query failed');
            mockedSection.findOne.mockRejectedValue(dbError);
            const newContactData = {
                address: 'New Address'
            };
            await expect((0, contactService_1.updateContactSection)(newContactData))
                .rejects.toThrow('Failed to update contact information');
        });
    });
});
