"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dailyEntryService = void 0;
const zod_1 = require("zod");
const errorHandler_1 = require("../../utils/errorHandler");
const connection_1 = require("../../database/connection");
const crypto_1 = require("crypto");
const listSchema = zod_1.z.object({
    dateFrom: zod_1.z.string().optional(),
    dateTo: zod_1.z.string().optional(),
    customerId: zod_1.z.string().optional(),
    status: zod_1.z.enum(['delivered', 'not_delivered']).optional(),
});
const createSchema = zod_1.z.object({
    customerId: zod_1.z.string().min(1, 'Customer ID is required'),
    productId: zod_1.z.string().optional(),
    entryDate: zod_1.z.string().optional(),
    quantity: zod_1.z.number().min(0, 'Quantity must be positive'),
    unitAmount: zod_1.z.number().optional(),
    extraAmount: zod_1.z.number().optional(),
    delivered: zod_1.z.boolean().optional(),
    notes: zod_1.z.string().optional(),
});
const updateSchema = zod_1.z.object({
    quantity: zod_1.z.number().optional(),
    extraQuantity: zod_1.z.number().optional(),
    delivered: zod_1.z.boolean().optional(),
    notes: zod_1.z.string().optional(),
    extraAmount: zod_1.z.number().optional(),
    productId: zod_1.z.string().optional(),
    unitAmount: zod_1.z.number().optional(),
});
class DailyEntryService {
    mapEntryRow(row) {
        return {
            id: row.id,
            sellerId: row.seller_id,
            customerId: row.customer_id,
            productId: row.product_id,
            entryDate: row.entry_date,
            quantity: Number(row.quantity),
            extraQuantity: row.extra_quantity ? Number(row.extra_quantity) : 0,
            unitAmount: row.unit_amount ? Number(row.unit_amount) : 0,
            extraAmount: row.extra_amount ? Number(row.extra_amount) : 0,
            delivered: row.delivered === 1 || row.delivered === true,
            notes: row.notes,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
    async list(sellerId, filters) {
        const params = listSchema.parse(filters ?? {});
        if (!sellerId) {
            throw new errorHandler_1.ApiError('sellerId required', 400);
        }
        const db = (0, connection_1.getDb)();
        const query = db('daily_entries').where('daily_entries.seller_id', sellerId);
        if (params.customerId) {
            query.where('daily_entries.customer_id', params.customerId);
        }
        if (params.dateFrom) {
            query.where('daily_entries.entry_date', '>=', params.dateFrom);
        }
        if (params.dateTo) {
            query.where('daily_entries.entry_date', '<=', params.dateTo);
        }
        if (params.status) {
            query.where('daily_entries.delivered', params.status === 'delivered');
        }
        const rows = await query
            .leftJoin('customers', 'daily_entries.customer_id', 'customers.id')
            .leftJoin('products', 'daily_entries.product_id', 'products.id')
            .select('daily_entries.*', 'customers.name as customer_name', 'customers.mobile as customer_mobile', 'products.name as product_name', 'products.unit as product_unit')
            .orderBy('daily_entries.entry_date', 'desc');
        return rows.map((row) => ({
            ...this.mapEntryRow(row),
            customerName: row.customer_name,
            customerMobile: row.customer_mobile,
            productName: row.product_name,
            productUnit: row.product_unit,
        }));
    }
    async create(sellerId, payload) {
        const data = createSchema.parse(payload);
        const db = (0, connection_1.getDb)();
        if (!sellerId) {
            throw new errorHandler_1.ApiError('Seller ID is required', 400);
        }
        // Resolve product
        let product = null;
        if (data.productId) {
            product = await db('products')
                .where({ id: data.productId, seller_id: sellerId })
                .first();
            if (!product) {
                throw new errorHandler_1.ApiError('Product not found for this seller', 404);
            }
        }
        else {
            product = await db('products')
                .where({ seller_id: sellerId, name: 'Milk' })
                .first();
            if (!product) {
                const productId = (0, crypto_1.randomUUID)();
                await db('products').insert({
                    id: productId,
                    seller_id: sellerId,
                    name: 'Milk',
                    price_per_unit: 0,
                    unit: 'litre',
                    status: 'active',
                });
                product = await db('products').where({ id: productId }).first();
            }
        }
        const entryDate = data.entryDate || new Date().toISOString().split('T')[0];
        const entryId = (0, crypto_1.randomUUID)();
        const unitAmount = data.unitAmount ?? Number(product?.price_per_unit ?? 0);
        await db('daily_entries').insert({
            id: entryId,
            seller_id: sellerId,
            customer_id: data.customerId,
            product_id: product.id,
            entry_date: entryDate,
            quantity: data.quantity,
            unit_amount: unitAmount,
            extra_amount: data.extraAmount || 0,
            delivered: data.delivered ?? true,
            notes: data.notes ?? null,
        });
        const entry = await db('daily_entries').where({ id: entryId }).first();
        return this.mapEntryRow(entry);
    }
    async update(entryId, payload) {
        const data = updateSchema.parse(payload);
        const db = (0, connection_1.getDb)();
        const existing = await db('daily_entries').where({ id: entryId }).first();
        if (!existing) {
            throw new errorHandler_1.ApiError('Daily entry not found', 404);
        }
        let productIdToUse = existing.product_id;
        let unitAmount = existing.unit_amount;
        if (data.productId) {
            const product = await db('products')
                .where({ id: data.productId, seller_id: existing.seller_id })
                .first();
            if (!product) {
                throw new errorHandler_1.ApiError('Product not found for this seller', 404);
            }
            productIdToUse = product.id;
            if (data.unitAmount === undefined) {
                unitAmount = Number(product.price_per_unit ?? unitAmount ?? 0);
            }
        }
        if (data.unitAmount !== undefined) {
            unitAmount = data.unitAmount;
        }
        await db('daily_entries')
            .where({ id: entryId })
            .update({
            quantity: data.quantity ?? existing.quantity,
            extra_quantity: data.extraQuantity !== undefined ? data.extraQuantity : existing.extra_quantity,
            extra_amount: data.extraAmount !== undefined ? data.extraAmount : existing.extra_amount,
            delivered: data.delivered ?? existing.delivered,
            notes: data.notes ?? existing.notes,
            unit_amount: unitAmount,
            product_id: productIdToUse,
            updated_at: db.fn.now(),
        });
        const updated = await db('daily_entries').where({ id: entryId }).first();
        return this.mapEntryRow(updated);
    }
    async delete(entryId) {
        const db = (0, connection_1.getDb)();
        const existing = await db('daily_entries').where({ id: entryId }).first();
        if (!existing) {
            throw new errorHandler_1.ApiError('Daily entry not found', 404);
        }
        await db('daily_entries').where({ id: entryId }).delete();
        return { success: true };
    }
    async markDelivery(entryId, payload) {
        const data = updateSchema.parse(payload);
        return this.update(entryId, { ...data, delivered: data.delivered ?? true });
    }
    async generateDailyEntriesForSeller(sellerId, entryDate) {
        const db = (0, connection_1.getDb)();
        const seller = await db('sellers').where({ id: sellerId }).first();
        if (!seller) {
            throw new errorHandler_1.ApiError('Seller not found', 404);
        }
        // Get all active customers for this seller
        const customers = await db('customers')
            .where({ seller_id: sellerId, active: true })
            .whereNull('exited_at')
            .where((builder) => {
            builder.whereNull('freeze_until').orWhere('freeze_until', '>', entryDate);
        });
        if (customers.length === 0) {
            return { generated: 0, skipped: 0 };
        }
        let generated = 0;
        let skipped = 0;
        for (const customer of customers) {
            const pauseFrom = customer.pause_from;
            const pauseTo = customer.pause_to;
            const isPaused = (pauseFrom && !pauseTo && pauseFrom <= entryDate) ||
                (!pauseFrom && pauseTo && pauseTo >= entryDate) ||
                (pauseFrom && pauseTo && pauseFrom <= entryDate && pauseTo >= entryDate);
            if (isPaused) {
                skipped++;
                continue;
            }
            // Get customer products with auto_entry enabled
            const customerProducts = await db('customer_products')
                .where({ customer_id: customer.id, active: true, auto_entry: true })
                .join('products', 'customer_products.product_id', 'products.id')
                .select('customer_products.product_id', 'customer_products.quantity', 'products.price_per_unit', 'products.unit');
            if (customerProducts.length === 0) {
                skipped++;
                continue;
            }
            // Generate entries for each product with auto_entry enabled
            for (const cp of customerProducts) {
                // Check if entry already exists for this date and product
                const existing = await db('daily_entries')
                    .where({
                    seller_id: sellerId,
                    customer_id: customer.id,
                    product_id: cp.product_id,
                    entry_date: entryDate,
                })
                    .first();
                if (existing) {
                    skipped++;
                    continue;
                }
                const entryId = (0, crypto_1.randomUUID)();
                await db('daily_entries').insert({
                    id: entryId,
                    seller_id: sellerId,
                    customer_id: customer.id,
                    product_id: cp.product_id,
                    entry_date: entryDate,
                    quantity: cp.quantity,
                    unit_amount: Number(cp.price_per_unit ?? 0),
                    extra_amount: 0,
                    delivered: true,
                });
                generated++;
            }
        }
        return { generated, skipped };
    }
    async generateDailyEntriesForAllSellers(entryDate) {
        const db = (0, connection_1.getDb)();
        const date = entryDate || new Date().toISOString().split('T')[0];
        const sellers = await db('sellers').where({ status: 'active' });
        const results = [];
        for (const seller of sellers) {
            try {
                const result = await this.generateDailyEntriesForSeller(seller.id, date);
                results.push({
                    sellerId: seller.id,
                    ...result,
                });
            }
            catch (error) {
                results.push({
                    sellerId: seller.id,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }
        return { date, results };
    }
}
exports.dailyEntryService = new DailyEntryService();
//# sourceMappingURL=dailyEntry.service.js.map