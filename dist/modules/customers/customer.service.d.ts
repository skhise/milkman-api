declare class CustomerService {
    private mapRow;
    create(sellerId: string, payload: unknown): Promise<{
        customer: {
            id: any;
            sellerId: any;
            name: any;
            mobile: any;
            email: any;
            address: any;
            addressLine1: any;
            addressLine2: any;
            city: any;
            state: any;
            postalCode: any;
            dailyQuantity: number;
            startDate: any;
            active: boolean;
            freezeUntil: any;
            pauseFrom: any;
            pauseTo: any;
            notes: any;
            exitedAt: any;
            userId: any;
            createdAt: any;
            updatedAt: any;
        };
        temporaryPin: string | null;
    }>;
    update(customerId: string, payload: unknown): Promise<{
        id: any;
        sellerId: any;
        name: any;
        mobile: any;
        email: any;
        address: any;
        addressLine1: any;
        addressLine2: any;
        city: any;
        state: any;
        postalCode: any;
        dailyQuantity: number;
        startDate: any;
        active: boolean;
        freezeUntil: any;
        pauseFrom: any;
        pauseTo: any;
        notes: any;
        exitedAt: any;
        userId: any;
        createdAt: any;
        updatedAt: any;
    }>;
    getByUserId(userId: string): Promise<{
        customer: {
            id: any;
            sellerId: any;
            name: any;
            mobile: any;
            email: any;
            address: any;
            addressLine1: any;
            addressLine2: any;
            city: any;
            state: any;
            postalCode: any;
            dailyQuantity: number;
            startDate: any;
            active: boolean;
            freezeUntil: any;
            pauseFrom: any;
            pauseTo: any;
            notes: any;
            exitedAt: any;
            userId: any;
            createdAt: any;
            updatedAt: any;
        };
    }>;
    setPauseWindow(customerId: string, payload: unknown): Promise<{
        id: any;
        sellerId: any;
        name: any;
        mobile: any;
        email: any;
        address: any;
        addressLine1: any;
        addressLine2: any;
        city: any;
        state: any;
        postalCode: any;
        dailyQuantity: number;
        startDate: any;
        active: boolean;
        freezeUntil: any;
        pauseFrom: any;
        pauseTo: any;
        notes: any;
        exitedAt: any;
        userId: any;
        createdAt: any;
        updatedAt: any;
    }>;
    getPauseHistory(customerId: string): Promise<any[]>;
    cancelPause(customerId: string, pauseId: string): Promise<{
        success: boolean;
    }>;
    toggleStatus(customerId: string, payload: unknown): Promise<{
        id: any;
        sellerId: any;
        name: any;
        mobile: any;
        email: any;
        address: any;
        addressLine1: any;
        addressLine2: any;
        city: any;
        state: any;
        postalCode: any;
        dailyQuantity: number;
        startDate: any;
        active: boolean;
        freezeUntil: any;
        pauseFrom: any;
        pauseTo: any;
        notes: any;
        exitedAt: any;
        userId: any;
        createdAt: any;
        updatedAt: any;
    }>;
    resetPin(customerId: string): Promise<{
        temporaryPin: string;
    }>;
    exit(customerId: string): Promise<{
        id: any;
        sellerId: any;
        name: any;
        mobile: any;
        email: any;
        address: any;
        addressLine1: any;
        addressLine2: any;
        city: any;
        state: any;
        postalCode: any;
        dailyQuantity: number;
        startDate: any;
        active: boolean;
        freezeUntil: any;
        pauseFrom: any;
        pauseTo: any;
        notes: any;
        exitedAt: any;
        userId: any;
        createdAt: any;
        updatedAt: any;
    }>;
    list(sellerId: string, filters: unknown): Promise<{
        customers: {
            products: {
                productId: any;
                quantity: number;
                autoEntry: boolean;
                productName: any;
                unit: any;
            }[];
            id: any;
            sellerId: any;
            name: any;
            mobile: any;
            email: any;
            address: any;
            addressLine1: any;
            addressLine2: any;
            city: any;
            state: any;
            postalCode: any;
            dailyQuantity: number;
            startDate: any;
            active: boolean;
            freezeUntil: any;
            pauseFrom: any;
            pauseTo: any;
            notes: any;
            exitedAt: any;
            userId: any;
            createdAt: any;
            updatedAt: any;
        }[];
    }>;
    /**
     * Clear expired pause windows for all customers
     * This is called by a cron job to automatically clear pauses that have passed their end date
     */
    clearExpiredPauses(): Promise<{
        cleared: number;
    }>;
}
export declare const customerService: CustomerService;
export {};
//# sourceMappingURL=customer.service.d.ts.map