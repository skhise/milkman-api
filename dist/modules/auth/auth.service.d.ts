declare class AuthService {
    login(payload: unknown): Promise<{
        token: string;
        user: {
            id: any;
            mobile: any;
            role: any;
            name: any;
            email: any;
            sellerId: string | null;
        };
    }>;
    registerSeller(payload: unknown): Promise<{
        status: string;
        mobile: string;
        pin: string;
        name: string;
        email: string;
        subscriptionPlanId: string;
        id: string;
    }>;
    requestPinReset(payload: unknown): Promise<{
        message: string;
        reference?: never;
    } | {
        message: string;
        reference: `${string}-${string}-${string}-${string}-${string}`;
    }>;
    verifyOtp(payload: unknown): Promise<{
        reference: string;
        token: string;
    }>;
    changePin(userId: string, payload: unknown): Promise<{
        message: string;
    }>;
    resetPin(payload: unknown): Promise<{
        message: string;
    }>;
}
export declare const authService: AuthService;
export {};
//# sourceMappingURL=auth.service.d.ts.map