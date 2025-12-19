declare class SellerService {
    private recordSubscriptionHistory;
    private createSellerSubscription;
    listSellers(filters?: unknown): Promise<{
        id: any;
        name: any;
        businessName: any;
        mobile: any;
        status: "Active" | "Pending" | "Inactive";
        subscriptionPlanId: any;
        subscriptionPlanName: any;
    }[]>;
    getDashboard(sellerId?: string): Promise<{
        sellerId: string;
        sellerName: any;
        plan: {
            name: any;
            amount: number | null;
            billingCycle: any;
        } | null;
        metrics: {
            totalCustomers: number;
            currentMonthBill: number;
            currentMonthPaid: number;
            pendingAmount: number;
            pendingBillsCount: number;
            pendingBillsAmount: number;
            monthlyConsumption: number;
            monthlyDeliveries: number;
        };
        upcomingCollections: {
            id: any;
            month: any;
            year: any;
            amount: number;
            status: any;
            dueDate: any;
        }[];
        recentCollections: {
            id: any;
            month: any;
            year: any;
            amount: number;
            status: any;
            dueDate: any;
            paidAt: any;
            paymentMode: any;
            reference: any;
        }[];
        recentCustomers: {
            id: any;
            name: any;
            mobile: any;
            joinedAt: any;
        }[];
    }>;
    updateProfile(sellerId: string, payload: unknown): Promise<{
        name?: string | undefined;
        subscriptionPlanId?: string | undefined;
        contactEmail?: string | undefined;
        sellerId: string;
    }>;
    updateSeller(sellerId: string, payload: unknown): Promise<{
        id: any;
        name: any;
        businessName: any;
        mobile: any;
        status: "Active" | "Pending" | "Inactive";
        subscriptionPlanId: any;
        subscriptionPlanName: any;
    }>;
    listCustomers(sellerId: string, filters: unknown): Promise<never[]>;
    getAnalytics(sellerId: string): Promise<{
        monthlySales: never[];
        collectionVsPending: never[];
        topCustomers: never[];
        productConsumption: never[];
        subscriptionDaysRemaining: number;
    }>;
    createSeller(payload: unknown): Promise<{
        seller: {
            id: `${string}-${string}-${string}-${string}-${string}`;
            name: string;
            businessName: string;
            mobile: string;
            status: "Active" | "Pending" | "Inactive";
            subscriptionPlanId: string;
        };
        user: {
            id: `${string}-${string}-${string}-${string}-${string}`;
            mobile: string;
        };
        temporaryPin: string;
        delivery: null;
    }>;
    updateSubscription(sellerId: string, payload: unknown): Promise<{
        message: string;
    }>;
    /**
     * Expire subscriptions that have passed their end date
     * This is called by a cron job to automatically expire subscriptions
     */
    expireSubscriptions(): Promise<{
        expiredCount: number;
        expiredSubscriptions: number;
    }>;
}
export declare const sellerService: SellerService;
export {};
//# sourceMappingURL=seller.service.d.ts.map