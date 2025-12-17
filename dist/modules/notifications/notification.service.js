"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
exports.initializeFirebaseAdmin = initializeFirebaseAdmin;
const zod_1 = require("zod");
const connection_1 = require("../../database/connection");
const crypto_1 = require("crypto");
// Firebase Admin - optional dependency
let firebaseAdmin = null;
let admin = null;
try {
    admin = require('firebase-admin');
}
catch (error) {
    console.warn('[FCM] firebase-admin not installed. Install it to enable push notifications.');
}
function initializeFirebaseAdmin() {
    if (firebaseAdmin)
        return firebaseAdmin;
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccount) {
        console.warn('[FCM] Firebase service account not configured. Notifications will not be sent.');
        return null;
    }
    try {
        const serviceAccountJson = JSON.parse(serviceAccount);
        firebaseAdmin = admin.initializeApp({
            credential: admin.credential.cert(serviceAccountJson),
        });
        console.log('[FCM] Firebase Admin initialized successfully');
        return firebaseAdmin;
    }
    catch (error) {
        console.error('[FCM] Error initializing Firebase Admin:', error);
        return null;
    }
}
const notificationSchema = zod_1.z.object({
    title: zod_1.z.string(),
    body: zod_1.z.string(),
    userIds: zod_1.z.array(zod_1.z.string()).optional(),
    channels: zod_1.z.array(zod_1.z.enum(['push', 'sms', 'email'])).default(['push']),
    data: zod_1.z.record(zod_1.z.any()).optional(),
});
class NotificationService {
    mapRow(row) {
        return {
            id: row.id,
            title: row.title,
            body: row.body,
            userId: row.user_id,
            readAt: row.read_at ? new Date(row.read_at).toISOString() : null,
            createdAt: new Date(row.created_at).toISOString(),
            data: row.data ? JSON.parse(row.data) : undefined,
        };
    }
    async list(userId) {
        const db = (0, connection_1.getDb)();
        const notifications = await db('notifications')
            .where({ user_id: userId })
            .orderBy('created_at', 'desc')
            .limit(100);
        return notifications.map((row) => this.mapRow(row));
    }
    async markAsRead(notificationId, userId) {
        const db = (0, connection_1.getDb)();
        await db('notifications')
            .where({ id: notificationId, user_id: userId })
            .update({
            read_at: db.fn.now(),
        });
        const updated = await db('notifications').where({ id: notificationId }).first();
        return this.mapRow(updated);
    }
    async markAllAsRead(userId) {
        const db = (0, connection_1.getDb)();
        await db('notifications')
            .where({ user_id: userId })
            .whereNull('read_at')
            .update({
            read_at: db.fn.now(),
        });
        return { success: true };
    }
    async getUnreadCount(userId) {
        const db = (0, connection_1.getDb)();
        const count = await db('notifications')
            .where({ user_id: userId })
            .whereNull('read_at')
            .count('id as count')
            .first();
        return { count: Number(count?.count || 0) };
    }
    async dispatch(payload) {
        const data = notificationSchema.parse(payload);
        const db = (0, connection_1.getDb)();
        if (!firebaseAdmin) {
            firebaseAdmin = initializeFirebaseAdmin();
        }
        const userIds = data.userIds || [];
        const results = [];
        for (const userId of userIds) {
            // Save notification to database
            const notificationId = (0, crypto_1.randomUUID)();
            await db('notifications').insert({
                id: notificationId,
                title: data.title,
                body: data.body,
                user_id: userId,
                channels: JSON.stringify(data.channels),
                data: data.data ? JSON.stringify(data.data) : null,
                created_at: db.fn.now(),
            });
            // Send FCM push notification if push channel is enabled
            if (data.channels.includes('push') && firebaseAdmin) {
                try {
                    const user = await db('users').where({ id: userId }).first();
                    if (user?.fcm_token) {
                        await firebaseAdmin.messaging().send({
                            token: user.fcm_token,
                            notification: {
                                title: data.title,
                                body: data.body,
                            },
                            data: {
                                notificationId,
                                ...(data.data || {}),
                            },
                            android: {
                                priority: 'high',
                            },
                            apns: {
                                headers: {
                                    'apns-priority': '10',
                                },
                            },
                        });
                        results.push({ userId, status: 'sent' });
                    }
                    else {
                        results.push({ userId, status: 'no_token' });
                    }
                }
                catch (error) {
                    console.error(`[FCM] Error sending notification to user ${userId}:`, error);
                    results.push({ userId, status: 'error', error: error.message });
                }
            }
            else {
                results.push({ userId, status: 'saved' });
            }
        }
        return { notifications: results };
    }
    async sendToUser(userId, title, body, data) {
        return this.dispatch({
            title,
            body,
            userIds: [userId],
            channels: ['push'],
            data,
        });
    }
}
exports.notificationService = new NotificationService();
//# sourceMappingURL=notification.service.js.map