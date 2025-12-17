"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = void 0;
const zod_1 = require("zod");
class AdminService {
    async listSellers() {
        return [];
    }
    async changeSellerStatus(sellerId, payload) {
        const data = zod_1.z.object({ status: zod_1.z.enum(['active', 'inactive', 'pending']) }).parse(payload);
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
exports.adminService = new AdminService();
//# sourceMappingURL=admin.service.js.map