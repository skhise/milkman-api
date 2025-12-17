declare class WalletService {
    getWallet(customerId: string): Promise<{
        customerId: string;
        balance: number;
    }>;
    addFunds(customerId: string, payload: unknown): Promise<{
        customerId: string;
        transaction: {
            amount: number;
            reference?: string | undefined;
            type: string;
        };
    }>;
    deductFunds(customerId: string, payload: unknown): Promise<{
        customerId: string;
        transaction: {
            amount: number;
            reference?: string | undefined;
            type: string;
        };
    }>;
}
export declare const walletService: WalletService;
export {};
//# sourceMappingURL=wallet.service.d.ts.map