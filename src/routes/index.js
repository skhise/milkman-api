import { Router } from 'express';
import authRouter from '../modules/auth/auth.routes.js';
import sellerRouter from '../modules/sellers/seller.routes.js';
import customerRouter from '../modules/customers/customer.routes.js';
import productRouter from '../modules/products/product.routes.js';
import dailyEntryRouter from '../modules/dailyEntries/dailyEntry.routes.js';
import billingRouter from '../modules/billing/billing.routes.js';
import paymentRouter from '../modules/payments/payment.routes.js';
import reportRouter from '../modules/reports/report.routes.js';
import notificationRouter from '../modules/notifications/notification.routes.js';
import subscriptionRouter from '../modules/subscriptions/subscription.routes.js';
import adsRouter from '../modules/ads/ads.routes.js';
import adminRouter from '../modules/admin/admin.routes.js';
import userRouter from '../modules/users/user.routes.js';
import walletRouter from '../modules/wallet/wallet.routes.js';
import healthRouter from './health.routes.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/sellers', sellerRouter);
router.use('/customers', customerRouter);
router.use('/products', productRouter);
router.use('/daily-entries', dailyEntryRouter);
router.use('/billing', billingRouter);
router.use('/payments', paymentRouter);
router.use('/reports', reportRouter);
router.use('/notifications', notificationRouter);
router.use('/subscriptions', subscriptionRouter);
router.use('/ads', adsRouter);
router.use('/admin', adminRouter);
router.use('/users', userRouter);
router.use('/wallet', walletRouter);

export default router;
