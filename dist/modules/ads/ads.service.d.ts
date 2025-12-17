export type AdResponse = {
    id: string;
    title: string;
    imageUrl: string;
    url?: string | null;
    expiresAt?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    status: 'active' | 'inactive';
    targeting?: Record<string, unknown> | null;
    createdAt: string;
    updatedAt: string;
};
declare class AdsService {
    private parseTargeting;
    private mapRow;
    listActive(): Promise<AdResponse[]>;
    create(payload: unknown): Promise<AdResponse>;
    update(adId: string, payload: unknown): Promise<AdResponse>;
    recordClick(adId: string, userId?: string, userRole?: string): Promise<{
        id: `${string}-${string}-${string}-${string}-${string}`;
        adId: string;
        year: number;
        month: number;
    }>;
    getMonthlyStats(adId: string, year?: number, month?: number): Promise<{
        year: any;
        month: any;
        clickCount: number;
        uniqueUsers: number;
    }[]>;
    getAdStats(adId: string): Promise<{
        totalClicks: number;
        uniqueUsers: number;
        monthlyStats: {
            year: any;
            month: any;
            clickCount: number;
            uniqueUsers: number;
        }[];
    }>;
}
export declare const adsService: AdsService;
export {};
//# sourceMappingURL=ads.service.d.ts.map