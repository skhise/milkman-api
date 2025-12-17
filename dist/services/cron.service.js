"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cronService = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const dailyEntry_service_1 = require("../modules/dailyEntries/dailyEntry.service");
const customer_service_1 = require("../modules/customers/customer.service");
class CronService {
    constructor() {
        this.jobs = [];
    }
    start() {
        // Run daily at 12:00 AM to generate entries for the current day
        // This creates entries for all active customers
        const dailyEntryJob = node_cron_1.default.schedule('0 0 * * *', async () => {
            console.log('[Cron] Starting daily entry generation...');
            try {
                const result = await dailyEntry_service_1.dailyEntryService.generateDailyEntriesForAllSellers();
                console.log('[Cron] Daily entry generation completed:', result);
            }
            catch (error) {
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
        const clearExpiredPausesJob = node_cron_1.default.schedule('0 1 * * *', async () => {
            console.log('[Cron] Starting expired pause cleanup...');
            try {
                const result = await customer_service_1.customerService.clearExpiredPauses();
                console.log('[Cron] Expired pause cleanup completed:', result);
            }
            catch (error) {
                console.error('[Cron] Error clearing expired pauses:', error);
            }
        }, {
            scheduled: false,
            timezone: 'Asia/Kolkata',
        });
        this.jobs.push(clearExpiredPausesJob);
        clearExpiredPausesJob.start();
        console.log('[Cron] Expired pause cleanup job scheduled (runs at 1:00 AM daily)');
    }
    stop() {
        this.jobs.forEach((job) => job.stop());
        this.jobs = [];
        console.log('[Cron] All scheduled jobs stopped');
    }
}
exports.cronService = new CronService();
//# sourceMappingURL=cron.service.js.map