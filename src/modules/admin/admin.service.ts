import { z } from 'zod';

class AdminService {
  async listSellers() {
    return [];
  }

  async changeSellerStatus(sellerId: string, payload: unknown) {
    const data = z.object({ status: z.enum(['active', 'inactive', 'pending']) }).parse(payload);
    return { sellerId, ...data };
  }

  async globalReports() {
    return {
      totalSellers: 0,
      totalCustomers: 0,
      totalRevenue: 0,
      activeSubscriptions: 0,
      adMetrics: [],
    };
  }
}

export const adminService = new AdminService();
