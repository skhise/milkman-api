export declare function initializeFirebaseAdmin(): any;
interface Notification {
    id: string;
    title: string;
    body: string;
    userId: string;
    readAt: string | null;
    createdAt: string;
    data?: Record<string, any>;
}
declare class NotificationService {
    private mapRow;
    list(userId: string): Promise<Notification[]>;
    markAsRead(notificationId: string, userId: string): Promise<Notification>;
    markAllAsRead(userId: string): Promise<{
        success: boolean;
    }>;
    getUnreadCount(userId: string): Promise<{
        count: number;
    }>;
    dispatch(payload: unknown): Promise<{
        notifications: ({
            userId: string;
            status: string;
            error?: never;
        } | {
            userId: string;
            status: string;
            error: any;
        })[];
    }>;
    sendToUser(userId: string, title: string, body: string, data?: Record<string, any>): Promise<{
        notifications: ({
            userId: string;
            status: string;
            error?: never;
        } | {
            userId: string;
            status: string;
            error: any;
        })[];
    }>;
}
export declare const notificationService: NotificationService;
export {};
//# sourceMappingURL=notification.service.d.ts.map