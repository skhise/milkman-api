"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productService = void 0;
const zod_1 = require("zod");
const errorHandler_1 = require("../../utils/errorHandler");
const connection_1 = require("../../database/connection");
const crypto_1 = require("crypto");
const productSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Product name is required'),
    pricePerUnit: zod_1.z.number().positive('Price must be positive'),
    unit: zod_1.z.enum(['litre', 'unit', 'kg']),
    status: zod_1.z.enum(['active', 'inactive']).default('active'),
});
const extraProductSchema = zod_1.z.object({
    customerId: zod_1.z.string().uuid('Valid customer ID required'),
    productName: zod_1.z.string().min(1, 'Product name is required'),
    price: zod_1.z.number().positive('Price must be positive'),
    quantity: zod_1.z.number().positive('Quantity must be positive').default(1),
    unit: zod_1.z.enum(['litre', 'unit', 'kg']).default('unit'),
    saleDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    notes: zod_1.z.string().optional(),
});
class ProductService {
    mapProductRow(row) {
        return {
            id: row.id,
            sellerId: row.seller_id,
            name: row.name,
            pricePerUnit: Number(row.price_per_unit),
            unit: row.unit,
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
    mapExtraProductRow(row) {
        return {
            id: row.id,
            sellerId: row.seller_id,
            customerId: row.customer_id,
            productName: row.product_name,
            price: Number(row.price),
            quantity: Number(row.quantity),
            unit: row.unit,
            saleDate: row.sale_date,
            notes: row.notes,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
    async create(sellerId, payload) {
        const data = productSchema.parse(payload);
        if (!sellerId) {
            throw new errorHandler_1.ApiError('sellerId required', 400);
        }
        const db = (0, connection_1.getDb)();
        const seller = await db('sellers').where({ id: sellerId }).first();
        if (!seller) {
            throw new errorHandler_1.ApiError('Seller not found', 404);
        }
        const productId = (0, crypto_1.randomUUID)();
        await db('products').insert({
            id: productId,
            seller_id: sellerId,
            name: data.name,
            price_per_unit: data.pricePerUnit,
            unit: data.unit,
            status: data.status,
        });
        const product = await db('products').where({ id: productId }).first();
        return this.mapProductRow(product);
    }
    async list(sellerId) {
        if (!sellerId) {
            throw new errorHandler_1.ApiError('sellerId required', 400);
        }
        const db = (0, connection_1.getDb)();
        const rows = await db('products')
            .where({ seller_id: sellerId })
            .orderBy('created_at', 'desc');
        return rows.map((row) => this.mapProductRow(row));
    }
    async update(productId, payload) {
        const data = productSchema.partial().parse(payload);
        const db = (0, connection_1.getDb)();
        const existing = await db('products').where({ id: productId }).first();
        if (!existing) {
            throw new errorHandler_1.ApiError('Product not found', 404);
        }
        await db('products')
            .where({ id: productId })
            .update({
            name: data.name ?? existing.name,
            price_per_unit: data.pricePerUnit ?? existing.price_per_unit,
            unit: data.unit ?? existing.unit,
            status: data.status ?? existing.status,
            updated_at: db.fn.now(),
        });
        const updated = await db('products').where({ id: productId }).first();
        return this.mapProductRow(updated);
    }
    async addExtraProduct(sellerId, payload) {
        const data = extraProductSchema.parse(payload);
        if (!sellerId) {
            throw new errorHandler_1.ApiError('sellerId required', 400);
        }
        const db = (0, connection_1.getDb)();
        const seller = await db('sellers').where({ id: sellerId }).first();
        if (!seller) {
            throw new errorHandler_1.ApiError('Seller not found', 404);
        }
        const customer = await db('customers')
            .where({ id: data.customerId, seller_id: sellerId })
            .first();
        if (!customer) {
            throw new errorHandler_1.ApiError('Customer not found', 404);
        }
        const extraProductId = (0, crypto_1.randomUUID)();
        await db('customer_extra_products').insert({
            id: extraProductId,
            seller_id: sellerId,
            customer_id: data.customerId,
            product_name: data.productName,
            price: data.price,
            quantity: data.quantity,
            unit: data.unit,
            sale_date: data.saleDate,
            notes: data.notes ?? null,
        });
        const extraProduct = await db('customer_extra_products')
            .where({ id: extraProductId })
            .first();
        return this.mapExtraProductRow(extraProduct);
    }
    async listExtraProducts(sellerId, customerId, dateFrom, dateTo) {
        if (!sellerId) {
            throw new errorHandler_1.ApiError('sellerId required', 400);
        }
        const db = (0, connection_1.getDb)();
        const query = db('customer_extra_products')
            .where({ seller_id: sellerId });
        if (customerId) {
            query.where({ customer_id: customerId });
        }
        if (dateFrom) {
            query.where('sale_date', '>=', dateFrom);
        }
        if (dateTo) {
            query.where('sale_date', '<=', dateTo);
        }
        const rows = await query.orderBy('sale_date', 'desc');
        return rows.map((row) => this.mapExtraProductRow(row));
    }
}
exports.productService = new ProductService();
//# sourceMappingURL=product.service.js.map