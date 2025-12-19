import { getDb } from '../../database/connection.js';

class CustomerService {
  async clearExpiredPauses() {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    try {
      const result = await db('customers')
        .whereNotNull('pause_to')
        .where('pause_to', '<', today)
        .update({
          pause_from: null,
          pause_to: null,
          updated_at: db.fn.now(),
        });

      console.log(`[Cron] Cleared ${result} expired pause windows`);
      return { cleared: result };
    } catch (error) {
      console.error('[Cron] Error clearing expired pauses:', error);
      throw error;
    }
  }
}

export const customerService = new CustomerService();
