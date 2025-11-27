"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const contactService_1 = require("../../services/contactService");
jest.mock('../../services/contactService');
describe('Contact Info Editing', () => {
    // TC-054: Edit contact info
    it('TC-054: should allow admin to edit contact info', async () => {
        contactService_1.updateContactSection.mockResolvedValue({ data: { address: 'Jl. Mawar' } });
        const result = await (0, contactService_1.updateContactSection)({ address: 'Jl. Mawar' });
        expect(result.data).toHaveProperty('address', 'Jl. Mawar');
    });
});
