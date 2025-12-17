"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("./notification.controller");
const router = (0, express_1.Router)({ mergeParams: true });
router.get('/:userId', notification_controller_1.listNotifications);
router.get('/:userId/unread-count', notification_controller_1.getUnreadCount);
router.post('/:userId/read/:notificationId', notification_controller_1.markAsRead);
router.post('/:userId/read-all', notification_controller_1.markAllAsRead);
router.post('/:userId/fcm-token', notification_controller_1.updateFcmToken);
router.post('/', notification_controller_1.dispatchNotification);
exports.default = router;
//# sourceMappingURL=notification.routes.js.map