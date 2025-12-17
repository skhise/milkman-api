declare class ReportService {
    customerConsumption(sellerId: string, filters: unknown): Promise<never[]>;
    productSales(sellerId: string, filters: unknown): Promise<never[]>;
    revenue(sellerId: string, filters: unknown): Promise<never[]>;
    download(type: string, filters: unknown): Promise<{
        buffer: Buffer<ArrayBuffer>;
        mimeType: string;
    }>;
}
export declare const reportService: ReportService;
export {};
//# sourceMappingURL=report.service.d.ts.map