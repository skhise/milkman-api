declare class BillingService {
    private mapBillRow;
    generate(sellerId: string, customerId: string, query: unknown): Promise<{
        items: {
            id: any;
            productId: any;
            serviceDate: any;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
            metadata: any;
        }[];
        id: any;
        sellerId: any;
        customerId: any;
        month: any;
        year: any;
        status: any;
        totalAmount: number;
        totalQuantity: number;
        previousDues: number;
        gstAmount: number;
        notes: any;
        issuedAt: any;
        dueDate: any;
        createdAt: any;
        updatedAt: any;
    }>;
    issueBill(billId: string): Promise<{
        id: any;
        sellerId: any;
        customerId: any;
        month: any;
        year: any;
        status: any;
        totalAmount: number;
        totalQuantity: number;
        previousDues: number;
        gstAmount: number;
        notes: any;
        issuedAt: any;
        dueDate: any;
        createdAt: any;
        updatedAt: any;
    }>;
    update(billId: string, payload: unknown): Promise<{
        id: any;
        sellerId: any;
        customerId: any;
        month: any;
        year: any;
        status: any;
        totalAmount: number;
        totalQuantity: number;
        previousDues: number;
        gstAmount: number;
        notes: any;
        issuedAt: any;
        dueDate: any;
        createdAt: any;
        updatedAt: any;
    }>;
    sendReminder(billId: string, payload: unknown): Promise<{
        id: string;
        message: string;
    }>;
    markPaid(billId: string, payload: unknown): Promise<{
        paymentMode: "cash" | "online" | "bank" | "upi";
        id: any;
        sellerId: any;
        customerId: any;
        month: any;
        year: any;
        status: any;
        totalAmount: number;
        totalQuantity: number;
        previousDues: number;
        gstAmount: number;
        notes: any;
        issuedAt: any;
        dueDate: any;
        createdAt: any;
        updatedAt: any;
    }>;
    markUnpaid(billId: string): Promise<{
        id: any;
        sellerId: any;
        customerId: any;
        month: any;
        year: any;
        status: any;
        totalAmount: number;
        totalQuantity: number;
        previousDues: number;
        gstAmount: number;
        notes: any;
        issuedAt: any;
        dueDate: any;
        createdAt: any;
        updatedAt: any;
    }>;
    listBills(sellerId: string, filters?: {
        year?: string;
        month?: string;
        status?: string;
        customerId?: string;
    }): Promise<{
        customerName: any;
        customerMobile: any;
        id: any;
        sellerId: any;
        customerId: any;
        month: any;
        year: any;
        status: any;
        totalAmount: number;
        totalQuantity: number;
        previousDues: number;
        gstAmount: number;
        notes: any;
        issuedAt: any;
        dueDate: any;
        createdAt: any;
        updatedAt: any;
    }[]>;
    generateMonthlyBillsForSeller(sellerId: string, month: string, year: string): Promise<{
        month: string;
        year: string;
        results: ({
            customerId: any;
            billId: any;
            success: boolean;
            error?: never;
        } | {
            customerId: any;
            success: boolean;
            error: string;
            billId?: never;
        })[];
    }>;
    getBillWithItems(billId: string): Promise<{
        customerName: any;
        customerMobile: any;
        customerAddress: any;
        sellerName: any;
        sellerBusiness: any;
        sellerMobile: any;
        items: {
            id: any;
            productId: any;
            serviceDate: any;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
            metadata: any;
        }[];
        id: any;
        sellerId: any;
        customerId: any;
        month: any;
        year: any;
        status: any;
        totalAmount: number;
        totalQuantity: number;
        previousDues: number;
        gstAmount: number;
        notes: any;
        issuedAt: any;
        dueDate: any;
        createdAt: any;
        updatedAt: any;
    }>;
    private getBillDetails;
    deleteBill(billId: string): Promise<void>;
    generateInvoicePdf(billId: string): Promise<{
        buffer: Buffer;
        filename: string;
    }>;
}
export declare const billingService: BillingService;
export {};
//# sourceMappingURL=billing.service.d.ts.map