"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFcmToken = exports.dispatchNotification = exports.getUnreadCount = exports.markAllAsRead = exports.markAsRead = exports.listNotifications = void 0;
const notification_service_1 = require("./notification.service");
const connection_1 = require("../../database/connection");
const listNotifications = async (req, res, next) => {
    try {
        const notifications = await notification_service_1.notificationService.list(req.params.userId);
        res.json(notifications);
    }
    catch (error) {
        next(error);
    }
};
exports.listNotifications = listNotifications;
const markAsRead = async (req, res, next) => {
    try {
        const notification = await notification_service_1.notificationService.markAsRead(req.params.notificationId, req.params.userId);
        res.json(notification);
    }
    catch (error) {
        next(error);
    }
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (req, res, next) => {
    try {
        const result = await notification_service_1.notificationService.markAllAsRead(req.params.userId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.markAllAsRead = markAllAsRead;
const getUnreadCount = async (req, res, next) => {
    try {
        const count = await notification_service_1.notificationService.getUnreadCount(req.params.userId);
        res.json(count);
    }
    catch (error) {
        next(error);
    }
};
exports.getUnreadCount = getUnreadCount;
const dispatchNotification = async (req, res, next) => {
    try {
        const result = await notification_service_1.notificationService.dispatch(req.body);
        res.status(202).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.dispatchNotification = dispatchNotification;
const updateFcmToken = async (req, res, next) => {
    try {
        const { fcmToken } = req.body;
        const userId = req.params.userId;
        if (!fcmToken || typeof fcmToken !== 'string') {
            return res.status(400).json({ message: 'FCM token is required' });
        }
        const db = (0, connection_1.getDb)();
        await db('users')
            .where({ id: userId })
            .update({
            fcm_token: fcmToken,
            fcm_token_updated_at: db.fn.now(),
            updated_at: db.fn.now(),
        });
        res.json({ success: true, message: 'FCM token updated' });
    }
    catch (error) {
        next(error);
    }
};
exports.updateFcmToken = updateFcmToken;
//# sourceMappingURL=notification.controller.js.map