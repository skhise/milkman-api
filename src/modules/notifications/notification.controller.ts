import { Request, Response, NextFunction } from 'express';
import { notificationService } from './notification.service';
import { getDb } from '../../database/connection';

export const listNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notifications = await notificationService.list(req.params.userId!);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notification = await notificationService.markAsRead(
      req.params.notificationId!,
      req.params.userId!,
    );
    res.json(notification);
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await notificationService.markAllAsRead(req.params.userId!);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await notificationService.getUnreadCount(req.params.userId!);
    res.json(count);
  } catch (error) {
    next(error);
  }
};

export const dispatchNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await notificationService.dispatch(req.body);
    res.status(202).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateFcmToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.params.userId!;

    if (!fcmToken || typeof fcmToken !== 'string') {
      return res.status(400).json({ message: 'FCM token is required' });
    }

    const db = getDb();
    await db('users')
      .where({ id: userId })
      .update({
        fcm_token: fcmToken,
        fcm_token_updated_at: db.fn.now(),
        updated_at: db.fn.now(),
      });

    res.json({ success: true, message: 'FCM token updated' });
  } catch (error) {
    next(error);
  }
};
