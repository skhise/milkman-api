"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = void 0;
const zod_1 = require("zod");
const connection_1 = require("../../database/connection");
const errorHandler_1 = require("../../utils/errorHandler");
const crypto_1 = require("crypto");
const collectionStatus = ['pending', 'overdue', 'paid'];
const paymentModes = ['cash', 'online', 'bank', 'upi'];
const markPaidSchema = zod_1.z.object({
    paymentMode: zod_1.z.enum(paymentModes),
    reference: zod_1.z.string().optional(),
});
const listCollectionsSchema = zod_1.z.object({
    status: zod_1.z.enum(collectionStatus).optional(),
});
const formatStatus = (status) => {
    if (collectionStatus.includes(status)) {
        return status;
    }
    return 'pending';
};
const getMonthlyAmount = (plan) => {
    if (plan.billingCycle === 'monthly') {
        return Number(plan.amount);
    }
    if (plan.billingCycle === 'yearly') {
        return Number((plan.amount / 12).toFixed(2));
    }
    return Number(plan.amount);
};
class PaymentService {
    mapCollectionRow(row) {
        return {
            id: row.id,
            sellerId: row.seller_id,
            sellerName: row.seller_name,
            businessName: row.business_name,
            mobile: row.seller_mobile,
            subscriptionPlanId: row.subscription_plan_id,
            subscriptionPlanName: row.plan_name,
            amount: Number(row.amount),
            dueDate: row.due_date,
            status: formatStatus(row.status),
            paymentMode: row.payment_mode,
            reference: row.reference,
            paidAt: row.paid_at,
            month: Number(row.month),
            year: Number(row.year),
        };
    }
    async fetchCollectionById(id) {
        const db = (0, connection_1.getDb)();
        const row = await db('seller_subscription_collections as c')
            .leftJoin('sellers as s', 'c.seller_id', 's.id')
            .leftJoin('users as u', 's.user_id', 'u.id')
            .leftJoin('subscription_plans as sp', 'c.subscription_plan_id', 'sp.id')
            .select('c.id', 'c.seller_id', 'c.subscription_plan_id', 'c.month', 'c.year', 'c.amount', 'c.status', 'c.due_date', 'c.payment_mode', 'c.reference', 'c.paid_at', 's.business_name', 'u.name as seller_name', 'u.mobile as seller_mobile', 'sp.name as plan_name')
            .where('c.id', id)
            .first();
        if (!row) {
            throw new errorHandler_1.ApiError('Collection not found', 404);
        }
        return this.mapCollectionRow(row);
    }
    async syncSubscriptionCollections() {
        const db = (0, connection_1.getDb)();
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const sellers = await db('sellers as s')
            .leftJoin('users as u', 's.user_id', 'u.id')
            .leftJoin('subscription_plans as sp', 's.subscription_plan_id', 'sp.id')
            .select('s.id as seller_id', 'u.name as name', 'u.mobile as mobile', 's.business_name as business_name', 's.billing_cycle_anchor', 'sp.id as plan_id', 'sp.name as plan_name', 'sp.price as plan_price', 'sp.billing_cycle as plan_billing_cycle')
            .whereNotNull('s.subscription_plan_id');
        if (!sellers.length) {
            return;
        }
        const monthsToGenerate = [0, 1, 2];
        const desiredEntries = [];
        sellers.forEach((seller) => {
            if (!seller.plan_id || seller.plan_price == null || !seller.plan_billing_cycle) {
                return;
            }
            monthsToGenerate.forEach((offset) => {
                const target = new Date(now);
                target.setMonth(now.getMonth() + offset, 1);
                target.setHours(0, 0, 0, 0);
                const month = `${target.getMonth() + 1}`.padStart(2, '0');
                const year = `${target.getFullYear()}`;
                desiredEntries.push({
                    id: (0, crypto_1.randomUUID)(),
                    seller_id: seller.seller_id,
                    subscription_plan_id: seller.plan_id,
                    month,
                    year,
                    amount: getMonthlyAmount({
                        amount: Number(seller.plan_price),
                        billingCycle: seller.plan_billing_cycle,
                    }),
                    due_date: target.toISOString().substring(0, 10),
                    created_at: now,
                    updated_at: now,
                });
            });
        });
        if (!desiredEntries.length) {
            return;
        }
        // Insert missing collections
        await db('seller_subscription_collections')
            .insert(desiredEntries)
            .onConflict(['seller_id', 'month', 'year'])
            .ignore();
        // Update existing pending/overdue rows with latest amount due_date if not paid
        await Promise.all(desiredEntries.map((entry) => db('seller_subscription_collections')
            .where({
            seller_id: entry.seller_id,
            month: entry.month,
            year: entry.year,
        })
            .whereNot('status', 'paid')
            .update({
            subscription_plan_id: entry.subscription_plan_id,
            amount: entry.amount,
            due_date: entry.due_date,
            updated_at: db.fn.now(),
        })));
        // Mark overdue items
        await db('seller_subscription_collections')
            .where('status', 'pending')
            .andWhere('due_date', '<', db.fn.now())
            .update({
            status: 'overdue',
            updated_at: db.fn.now(),
        });
    }
    async listSubscriptionCollections(filters) {
        const params = listCollectionsSchema.parse(filters ?? {});
        await this.syncSubscriptionCollections();
        const db = (0, connection_1.getDb)();
        const query = db('seller_subscription_collections as c')
            .leftJoin('sellers as s', 'c.seller_id', 's.id')
            .leftJoin('users as u', 's.user_id', 'u.id')
            .leftJoin('subscription_plans as sp', 'c.subscription_plan_id', 'sp.id')
            .select('c.id', 'c.seller_id', 'c.subscription_plan_id', 'c.month', 'c.year', 'c.amount', 'c.status', 'c.due_date', 'c.payment_mode', 'c.reference', 'c.paid_at', 's.business_name', 'u.name as seller_name', 'u.mobile as seller_mobile', 'sp.name as plan_name')
            .orderBy('c.due_date', 'asc');
        if (params.status) {
            query.where('c.status', params.status);
        }
        const rows = await query;
        return rows.map((row) => this.mapCollectionRow(row));
    }
    async markSubscriptionCollectionPaid(collectionId, payload) {
        const data = markPaidSchema.parse(payload);
        const db = (0, connection_1.getDb)();
        const collection = await db('seller_subscription_collections')
            .where({ id: collectionId })
            .first();
        if (!collection) {
            throw new errorHandler_1.ApiError('Collection not found', 404);
        }
        if (collection.status === 'paid') {
            throw new errorHandler_1.ApiError('Collection already marked as paid', 400);
        }
        await db('seller_subscription_collections')
            .where({ id: collectionId })
            .update({
            status: 'paid',
            payment_mode: data.paymentMode,
            reference: data.reference ?? null,
            paid_at: db.fn.now(),
            updated_at: db.fn.now(),
        });
        return this.fetchCollectionById(collectionId);
    }
}
exports.paymentService = new PaymentService();
//# sourceMappingURL=payment.service.js.map