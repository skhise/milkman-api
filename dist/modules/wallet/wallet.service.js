"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletService = void 0;
const zod_1 = require("zod");
const walletSchema = zod_1.z.object({
    amount: zod_1.z.number(),
    reference: zod_1.z.string().optional(),
});
class WalletService {
    async getWallet(customerId) {
        return { customerId, balance: 0 };
    }
    async addFunds(customerId, payload) {
        const data = walletSchema.parse(payload);
        return { customerId, transaction: { type: 'credit', ...data } };
    }
    async deductFunds(customerId, payload) {
        const data = walletSchema.parse(payload);
        return { customerId, transaction: { type: 'debit', ...data } };
    }
}
exports.walletService = new WalletService();
//# sourceMappingURL=wallet.service.js.map