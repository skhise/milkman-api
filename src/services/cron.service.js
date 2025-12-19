import cron from 'node-cron';
import { dailyEntryService } from '../modules/dailyEntries/dailyEntry.service.js';
import { customerService } from '../modules/customers/customer.service.js';
import { billingService } from '../modules/billing/billing.service.js';
import { sellerService } from '../modules/sellers/seller.service.js';

class CronService {
  constructor() {
    this.jobs = [];
  }

  start() {
    // Run daily at 12:00 AM to generate entries for the current day
    // This creates entries for all active customers
    const dailyEntryJob = cron.schedule('0 0 * * *', async () => {
      console.log('[Cron] Starting daily entry generation...');
      try {
        const result = await dailyEntryService.generateDailyEntriesForAllSellers();
        console.log('[Cron] Daily entry generation completed:', result);
      } catch (error) {
        console.error('[Cron] Error generating daily entries:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Kolkata', // Adjust timezone as needed
    });

    this.jobs.push(dailyEntryJob);
    dailyEntryJob.start();
    console.log('[Cron] Daily entry generation job scheduled (runs at 12:00 AM daily)');

    // Run daily at 1:00 AM to clear expired supply pauses
    // This automatically clears pause windows that have passed their end date
    const clearExpiredPausesJob = cron.schedule('0 1 * * *', async () => {
      console.log('[Cron] Starting expired pause cleanup...');
      try {
        const result = await customerService.clearExpiredPauses();
        console.log('[Cron] Expired pause cleanup completed:', result);
      } catch (error) {
        console.error('[Cron] Error clearing expired pauses:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Kolkata',
    });

    this.jobs.push(clearExpiredPausesJob);
    clearExpiredPausesJob.start();
    console.log('[Cron] Expired pause cleanup job scheduled (runs at 1:00 AM daily)');

    // Run monthly on the 1st at 2:00 AM to generate bills for the previous month
    // This generates bills for all sellers for the previous month
    const billGenerationJob = cron.schedule('0 2 1 * *', async () => {
      console.log('[Cron] Starting monthly bill generation...');
      try {
        const today = new Date();
        // Calculate previous month (if current month is January (0), previous is December (12))
        const currentMonth = today.getMonth(); // 0-11 (0 = January)
        const previousMonth = currentMonth === 0 ? 12 : currentMonth; // If January, previous month is December
        const previousYear = currentMonth === 0 ? today.getFullYear() - 1 : today.getFullYear();
        const month = String(previousMonth).padStart(2, '0');
        const year = String(previousYear);

        const result = await billingService.generateMonthlyBillsForAllSellers(month, year);
        console.log('[Cron] Monthly bill generation completed:', result);
      } catch (error) {
        console.error('[Cron] Error generating monthly bills:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Kolkata',
    });

    this.jobs.push(billGenerationJob);
    billGenerationJob.start();
    console.log('[Cron] Monthly bill generation job scheduled (runs on 1st of each month at 2:00 AM)');

    // Run daily at 3:00 AM to expire subscriptions that have passed their end date
    const planExpiryJob = cron.schedule('0 3 * * *', async () => {
      console.log('[Cron] Starting subscription plan expiry check...');
      try {
        const result = await sellerService.expireSubscriptions();
        console.log('[Cron] Subscription plan expiry check completed:', result);
      } catch (error) {
        console.error('[Cron] Error expiring subscriptions:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Kolkata',
    });

    this.jobs.push(planExpiryJob);
    planExpiryJob.start();
    console.log('[Cron] Subscription plan expiry job scheduled (runs at 3:00 AM daily)');
  }

  stop() {
    this.jobs.forEach((job) => job.stop());
    this.jobs = [];
    console.log('[Cron] All scheduled jobs stopped');
  }
}

export const cronService = new CronService();
