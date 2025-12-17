declare class DailyEntryService {
    private mapEntryRow;
    list(sellerId: string, filters: unknown): Promise<{
        customerName: any;
        customerMobile: any;
        productName: any;
        productUnit: any;
        id: any;
        sellerId: any;
        customerId: any;
        productId: any;
        entryDate: any;
        quantity: number;
        extraQuantity: number;
        unitAmount: number;
        extraAmount: number;
        delivered: boolean;
        notes: any;
        createdAt: any;
        updatedAt: any;
    }[]>;
    create(sellerId: string, payload: unknown): Promise<{
        id: any;
        sellerId: any;
        customerId: any;
        productId: any;
        entryDate: any;
        quantity: number;
        extraQuantity: number;
        unitAmount: number;
        extraAmount: number;
        delivered: boolean;
        notes: any;
        createdAt: any;
        updatedAt: any;
    }>;
    update(entryId: string, payload: unknown): Promise<{
        id: any;
        sellerId: any;
        customerId: any;
        productId: any;
        entryDate: any;
        quantity: number;
        extraQuantity: number;
        unitAmount: number;
        extraAmount: number;
        delivered: boolean;
        notes: any;
        createdAt: any;
        updatedAt: any;
    }>;
    delete(entryId: string): Promise<{
        success: boolean;
    }>;
    markDelivery(entryId: string, payload: unknown): Promise<{
        id: any;
        sellerId: any;
        customerId: any;
        productId: any;
        entryDate: any;
        quantity: number;
        extraQuantity: number;
        unitAmount: number;
        extraAmount: number;
        delivered: boolean;
        notes: any;
        createdAt: any;
        updatedAt: any;
    }>;
    generateDailyEntriesForSeller(sellerId: string, entryDate: string): Promise<{
        generated: number;
        skipped: number;
    }>;
    generateDailyEntriesForAllSellers(entryDate?: string): Promise<{
        date: string;
        results: ({
            generated: number;
            skipped: number;
            sellerId: any;
            error?: never;
        } | {
            sellerId: any;
            error: string;
        })[];
    }>;
}
export declare const dailyEntryService: DailyEntryService;
export {};
//# sourceMappingURL=dailyEntry.service.d.ts.map