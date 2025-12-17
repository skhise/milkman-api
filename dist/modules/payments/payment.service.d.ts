declare class PaymentService {
    private mapCollectionRow;
    private fetchCollectionById;
    private syncSubscriptionCollections;
    listSubscriptionCollections(filters?: unknown): Promise<{
        id: any;
        sellerId: any;
        sellerName: any;
        businessName: any;
        mobile: any;
        subscriptionPlanId: any;
        subscriptionPlanName: any;
        amount: number;
        dueDate: any;
        status: "pending" | "paid" | "overdue";
        paymentMode: any;
        reference: any;
        paidAt: any;
        month: number;
        year: number;
    }[]>;
    markSubscriptionCollectionPaid(collectionId: string, payload: unknown): Promise<{
        id: any;
        sellerId: any;
        sellerName: any;
        businessName: any;
        mobile: any;
        subscriptionPlanId: any;
        subscriptionPlanName: any;
        amount: number;
        dueDate: any;
        status: "pending" | "paid" | "overdue";
        paymentMode: any;
        reference: any;
        paidAt: any;
        month: number;
        year: number;
    }>;
}
export declare const paymentService: PaymentService;
export {};
//# sourceMappingURL=payment.service.d.ts.map