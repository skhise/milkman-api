"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportService = void 0;
const zod_1 = require("zod");
const filterSchema = zod_1.z.object({
    month: zod_1.z.string().optional(),
    year: zod_1.z.string().optional(),
    customerId: zod_1.z.string().optional(),
    productId: zod_1.z.string().optional(),
});
class ReportService {
    async customerConsumption(sellerId, filters) {
        filterSchema.parse(filters ?? {});
        return [];
    }
    async productSales(sellerId, filters) {
        filterSchema.parse(filters ?? {});
        return [];
    }
    async revenue(sellerId, filters) {
        filterSchema.parse(filters ?? {});
        return [];
    }
    async download(type, filters) {
        filterSchema.parse(filters ?? {});
        const buffer = Buffer.from('Report data');
        const mimeType = type === 'excel' ? 'application/vnd.ms-excel' : 'application/pdf';
        return { buffer, mimeType };
    }
}
exports.reportService = new ReportService();
//# sourceMappingURL=report.service.js.map