declare class UserService {
    dashboard(userId: string): Promise<{
        userId: string;
        totalSellers: number;
        activeSellers: number;
        pendingSellers: number;
        sellersWithPlans: number;
        activePlans: number;
        monthlyRevenue: number;
        pendingCollections: number;
        recentSellers: {
            id: any;
            name: any;
            businessName: any;
            mobile: any;
            status: "Active" | "Pending" | "Inactive";
            subscriptionPlanName: any;
        }[];
    }>;
    markBillPaid(billId: string, payload: unknown): Promise<{
        status: string;
        amount: number;
        mode: "cash" | "online" | "bank" | "upi";
        attachmentUrl?: string | undefined;
        billId: string;
    }>;
    consumption(userId: string, filters: unknown): Promise<never[]>;
}
export declare const userService: UserService;
export {};
//# sourceMappingURL=user.service.d.ts.map