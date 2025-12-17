import { Router } from 'express';
import {
  dispatchNotification,
  listNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  updateFcmToken,
} from './notification.controller';

const router = Router({ mergeParams: true });

router.get('/:userId', listNotifications);
router.get('/:userId/unread-count', getUnreadCount);
router.post('/:userId/read/:notificationId', markAsRead);
router.post('/:userId/read-all', markAllAsRead);
router.post('/:userId/fcm-token', updateFcmToken);
router.post('/', dispatchNotification);

export default router;
