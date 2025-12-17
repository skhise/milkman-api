import { z } from 'zod';

const walletSchema = z.object({
  amount: z.number(),
  reference: z.string().optional(),
});

class WalletService {
  async getWallet(customerId: string) {
    return { customerId, balance: 0 };
  }

  async addFunds(customerId: string, payload: unknown) {
    const data = walletSchema.parse(payload);
    return { customerId, transaction: { type: 'credit', ...data } };
  }

  async deductFunds(customerId: string, payload: unknown) {
    const data = walletSchema.parse(payload);
    return { customerId, transaction: { type: 'debit', ...data } };
  }
}

export const walletService = new WalletService();
