declare class SubscriptionService {
    listPlans(): Promise<{
        id: any;
        name: any;
        amount: number;
        planType: string;
        customerLimit: any;
        productLimit: any;
        description: any;
        createdAt: any;
        updatedAt: any;
        deletedAt: any;
    }[]>;
    createPlan(payload: unknown): Promise<{
        id: any;
        name: any;
        amount: number;
        planType: string;
        customerLimit: any;
        productLimit: any;
        description: any;
        createdAt: any;
        updatedAt: any;
        deletedAt: any;
    }>;
    updatePlan(planId: string, payload: unknown): Promise<{
        id: any;
        name: any;
        amount: number;
        planType: string;
        customerLimit: any;
        productLimit: any;
        description: any;
        createdAt: any;
        updatedAt: any;
        deletedAt: any;
    }>;
    softDeletePlan(planId: string): Promise<{
        id: any;
        name: any;
        amount: number;
        planType: string;
        customerLimit: any;
        productLimit: any;
        description: any;
        createdAt: any;
        updatedAt: any;
        deletedAt: any;
    }>;
    assignPlan(sellerId: string, payload: unknown): Promise<{
        status: string;
        planId: string;
        paymentReference?: string | undefined;
        sellerId: string;
    }>;
}
export declare const subscriptionService: SubscriptionService;
export {};
//# sourceMappingURL=subscription.service.d.ts.map