declare class AdminService {
    listSellers(): Promise<never[]>;
    changeSellerStatus(sellerId: string, payload: unknown): Promise<{
        status: "active" | "pending" | "inactive";
        sellerId: string;
    }>;
    globalReports(): Promise<{
        totalSellers: number;
        totalCustomers: number;
        totalRevenue: number;
        activeSubscriptions: number;
        adMetrics: never[];
    }>;
}
export declare const adminService: AdminService;
export {};
//# sourceMappingURL=admin.service.d.ts.map