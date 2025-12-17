import { Router } from 'express';
import authRouter from '../modules/auth/auth.routes';
import sellerRouter from '../modules/sellers/seller.routes';
import customerRouter from '../modules/customers/customer.routes';
import productRouter from '../modules/products/product.routes';
import dailyEntryRouter from '../modules/dailyEntries/dailyEntry.routes';
import billingRouter from '../modules/billing/billing.routes';
import paymentRouter from '../modules/payments/payment.routes';
import reportRouter from '../modules/reports/report.routes';
import notificationRouter from '../modules/notifications/notification.routes';
import subscriptionRouter from '../modules/subscriptions/subscription.routes';
import adsRouter from '../modules/ads/ads.routes';
import adminRouter from '../modules/admin/admin.routes';
import userRouter from '../modules/users/user.routes';
import walletRouter from '../modules/wallet/wallet.routes';
import healthRouter from './health.routes';

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
