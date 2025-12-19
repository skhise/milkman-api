"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.billingService = void 0;
const zod_1 = require("zod");
const errorHandler_1 = require("../../utils/errorHandler");
const connection_1 = require("../../database/connection");
const crypto_1 = require("crypto");
const pdfkit_1 = __importDefault(require("pdfkit"));
const reminderSchema = zod_1.z.object({
    channel: zod_1.z.enum(['push', 'sms', 'email']).default('push'),
    message: zod_1.z.string().optional(),
});
const paymentSchema = zod_1.z.object({
    mode: zod_1.z.enum(['cash', 'online', 'bank', 'upi']),
    reference: zod_1.z.string().optional(),
    attachmentUrl: zod_1.z.string().optional(),
});
class BillingService {
    mapBillRow(row) {
        return {
            id: row.id,
            sellerId: row.seller_id,
            customerId: row.customer_id,
            month: row.month,
            year: row.year,
            status: row.status,
            totalAmount: Number(row.total_amount),
            totalQuantity: Number(row.total_quantity),
            previousDues: Number(row.previous_dues),
            gstAmount: Number(row.gst_amount),
            notes: row.notes,
            issuedAt: row.issued_at,
            dueDate: row.due_date,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
    async generate(sellerId, customerId, query) {
        const params = zod_1.z.object({ month: zod_1.z.string(), year: zod_1.z.string() }).parse(query);
        const db = (0, connection_1.getDb)();
        const seller = await db('sellers').where({ id: sellerId }).first();
        if (!seller) {
            throw new errorHandler_1.ApiError('Seller not found', 404);
        }
        const customer = await db('customers')
            .where({ id: customerId, seller_id: sellerId })
            .first();
        if (!customer) {
            throw new errorHandler_1.ApiError('Customer not found', 404);
        }
        // Check if bill already exists
        const existingBill = await db('bills')
            .where({
            seller_id: sellerId,
            customer_id: customerId,
            month: params.month,
            year: params.year,
        })
            .first();
        // Calculate date range for the month
        const year = parseInt(params.year);
        const month = parseInt(params.month); // month is 1-12
        const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        // JavaScript Date month is 0-indexed (0-11), so we need month (not month-1) to get the next month
        // new Date(year, month, 0) gives the last day of (month-1) in 0-indexed terms
        // For month 12: new Date(2024, 12, 0) = last day of month 11 (December) = Dec 31 ✓
        // For month 1: new Date(2024, 1, 0) = last day of month 0 (January) = Jan 31 ✓
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];
        // Calculate number of days in the month
        // Same logic: new Date(year, month, 0).getDate() gives days in the current month
        const daysInMonth = new Date(year, month, 0).getDate();
        // Get customer's assigned products (all active products - billing should include all assigned products)
        const customerProducts = await db('customer_products as cp')
            .join('products as p', 'cp.product_id', 'p.id')
            .where({ 'cp.customer_id': customerId, 'cp.active': true })
            .where({ 'p.seller_id': sellerId, 'p.status': 'active' })
            .select('cp.id as customer_product_id', 'cp.product_id', 'cp.quantity as assigned_quantity', 'p.name as product_name', 'p.price_per_unit', 'p.unit as product_unit');
        // Debug logging
        console.log(`[Billing] Customer ${customerId}, Month ${params.month}/${params.year}`);
        console.log(`[Billing] Found ${customerProducts.length} customer products`);
        customerProducts.forEach((cp, idx) => {
            console.log(`[Billing] Product ${idx + 1}: ${cp.product_name}, Qty: ${cp.assigned_quantity}, Price: ${cp.price_per_unit}, Unit: ${cp.product_unit}`);
        });
        console.log(`[Billing] Days in month: ${daysInMonth}, Date range: ${startDate} to ${endDate}`);
        // Get all daily entries for this customer in the month (for actual delivered quantities)
        const dailyEntries = await db('daily_entries')
            .where({ seller_id: sellerId, customer_id: customerId })
            .whereBetween('entry_date', [startDate, endDate])
            .where('delivered', true)
            .orderBy('entry_date', 'asc');
        console.log(`[Billing] Daily entries found: ${dailyEntries.length}`);
        // Get all extra products for this customer in the month
        const extraProducts = await db('customer_extra_products')
            .where({ seller_id: sellerId, customer_id: customerId })
            .whereBetween('sale_date', [startDate, endDate]);
        // Calculate totals
        let totalQuantity = 0;
        let totalAmount = 0;
        const billItems = [];
        // Group daily entries by product_id to calculate actual delivered quantities and extra amounts
        const deliveredQuantitiesByProduct = new Map();
        const deliveredDaysByProduct = new Map(); // Track actual delivery days
        let totalExtraAmount = 0;
        for (const entry of dailyEntries) {
            const productId = entry.product_id;
            const quantity = Number(entry.quantity || 0);
            const extraAmount = Number(entry.extra_amount || 0);
            const existingQty = deliveredQuantitiesByProduct.get(productId) || 0;
            deliveredQuantitiesByProduct.set(productId, existingQty + quantity);
            // Track delivery days per product
            const existingDays = deliveredDaysByProduct.get(productId) || 0;
            deliveredDaysByProduct.set(productId, existingDays + 1);
            totalExtraAmount += extraAmount;
        }
        // Log delivered quantities for debugging
        console.log(`[Billing] Delivered quantities by product:`);
        for (const [productId, qty] of deliveredQuantitiesByProduct.entries()) {
            const days = deliveredDaysByProduct.get(productId) || 0;
            console.log(`  Product ${productId}: ${qty} units over ${days} days`);
        }
        // Calculate bill items based on assigned customer products
        for (const cp of customerProducts) {
            const productId = cp.product_id;
            const assignedQuantity = Number(cp.assigned_quantity || 0);
            const pricePerUnit = Number(cp.price_per_unit || 0);
            const productUnit = cp.product_unit?.toLowerCase() || 'unit';
            // Validate inputs
            if (assignedQuantity <= 0 && !deliveredQuantitiesByProduct.has(productId)) {
                // Skip products with no assigned quantity and no deliveries
                continue;
            }
            if (pricePerUnit <= 0) {
                console.warn(`Product ${cp.product_name} (${productId}) has zero or invalid price_per_unit: ${pricePerUnit}`);
                // Still include it but with 0 amount
            }
            // Use actual delivered quantity if available, otherwise use assigned quantity * days
            const deliveredQty = deliveredQuantitiesByProduct.get(productId);
            const deliveredDays = deliveredDaysByProduct.get(productId) || 0;
            // Calculate monthly quantity:
            // - If we have daily entries, use the sum of delivered quantities (more accurate)
            // - Otherwise, use assigned quantity × days in month
            const monthlyQuantity = deliveredQty !== undefined
                ? deliveredQty
                : assignedQuantity * daysInMonth;
            // Calculate total amount - Simple multiplication: quantity × price
            // Formula: monthlyQuantity × price_per_unit
            // No GST, no taxes, no extra charges - just the product price
            // 
            // Examples:
            // - Product with ₹60/unit and quantity 30 = 30 × 60 = ₹1800
            // - Product with ₹60/L and quantity 30L = 30 × 60 = ₹1800
            // - Product with ₹10/unit and quantity 30 = 30 × 10 = ₹300
            const unitPrice = pricePerUnit;
            const productTotal = monthlyQuantity * unitPrice; // Simple: qty × price
            console.log(`[Billing] Product: ${cp.product_name} (${productId})`);
            console.log(`  AssignedQty: ${assignedQuantity} ${productUnit}/day`);
            console.log(`  DeliveredQty: ${deliveredQty ?? 'N/A'} over ${deliveredDays} days`);
            console.log(`  MonthlyQty: ${monthlyQuantity} ${productUnit}`);
            console.log(`  Price: ₹${pricePerUnit}/${productUnit}`);
            console.log(`  Total: ₹${productTotal}`);
            totalQuantity += monthlyQuantity;
            totalAmount += productTotal;
            // Create a bill item for the entire month (or use first day as service date)
            billItems.push({
                product_id: productId,
                service_date: startDate,
                quantity: monthlyQuantity,
                unit_price: unitPrice,
                total_price: productTotal,
                metadata: JSON.stringify({
                    product_name: cp.product_name,
                    product_unit: cp.product_unit,
                    assigned_quantity: assignedQuantity,
                    days_in_month: daysInMonth,
                    actual_delivered: deliveredQty !== undefined,
                    customer_product_id: cp.customer_product_id,
                }),
            });
        }
        // Add total extra amount from daily entries as a separate line item if exists
        if (totalExtraAmount > 0) {
            totalAmount += totalExtraAmount;
            billItems.push({
                product_id: null,
                service_date: startDate,
                quantity: 0,
                unit_price: 0,
                total_price: totalExtraAmount,
                metadata: JSON.stringify({
                    product_name: 'Extra Charges',
                    source: 'daily_entries_extra_amount',
                }),
            });
        }
        // Add extra products (one-time purchases)
        for (const extra of extraProducts) {
            const quantity = Number(extra.quantity);
            const unitPrice = Number(extra.price);
            const totalPrice = quantity * unitPrice;
            totalAmount += totalPrice;
            billItems.push({
                product_id: null,
                service_date: extra.sale_date,
                quantity,
                unit_price: unitPrice,
                total_price: totalPrice,
                metadata: JSON.stringify({
                    product_name: extra.product_name,
                    unit: extra.unit,
                    extra_product_id: extra.id,
                }),
            });
        }
        // If no customer products assigned, check if there are any daily entries and use those
        if (customerProducts.length === 0 && dailyEntries.length > 0) {
            // Get unique product IDs from daily entries
            const productIds = [...new Set(dailyEntries.map((e) => e.product_id).filter(Boolean))];
            // Fetch products
            const products = productIds.length > 0
                ? await db('products')
                    .where({ seller_id: sellerId })
                    .whereIn('id', productIds)
                : [];
            const productMap = new Map(products.map((p) => [p.id, p]));
            // Group entries by product and date
            const entriesByProduct = new Map();
            for (const entry of dailyEntries) {
                const productId = entry.product_id;
                const quantity = Number(entry.quantity || 0);
                const entryDate = entry.entry_date;
                if (!entriesByProduct.has(productId)) {
                    entriesByProduct.set(productId, { quantity: 0, dates: [] });
                }
                const existing = entriesByProduct.get(productId);
                existing.quantity += quantity;
                if (!existing.dates.includes(entryDate)) {
                    existing.dates.push(entryDate);
                }
            }
            // Create bill items from daily entries
            for (const [productId, data] of entriesByProduct.entries()) {
                const product = productMap.get(productId);
                const productUnit = product?.unit?.toLowerCase() || 'unit';
                const pricePerUnit = product ? Number(product.price_per_unit || 0) : 0;
                // For both litre/kg and unit, calculation is: quantity × price_per_unit
                // The difference is semantic: for litre/kg it's "per litre/kg", for unit it's "per unit"
                const unitPrice = pricePerUnit;
                const productTotal = data.quantity * unitPrice;
                totalQuantity += data.quantity;
                totalAmount += productTotal;
                billItems.push({
                    product_id: productId,
                    service_date: startDate,
                    quantity: data.quantity,
                    unit_price: unitPrice,
                    total_price: productTotal,
                    metadata: JSON.stringify({
                        product_name: product?.name || 'Product',
                        product_unit: product?.unit || 'unit',
                        delivery_dates: data.dates,
                        source: 'daily_entries',
                    }),
                });
            }
        }
        // Get previous month's unpaid bills
        const previousBills = await db('bills')
            .where({ seller_id: sellerId, customer_id: customerId })
            .whereIn('status', ['issued', 'overdue'])
            .sum('total_amount as sum')
            .first();
        const previousDues = Number(previousBills?.sum ?? 0);
        console.log(`[Billing] ===== BILL CALCULATION SUMMARY =====`);
        console.log(`[Billing] Customer Products: ${customerProducts.length}`);
        console.log(`[Billing] Daily Entries: ${dailyEntries.length}`);
        console.log(`[Billing] Extra Products: ${extraProducts.length}`);
        console.log(`[Billing] Bill Items Created: ${billItems.length}`);
        console.log(`[Billing] Total Quantity: ${totalQuantity}`);
        console.log(`[Billing] Product Subtotal: ₹${totalAmount}`);
        console.log(`[Billing] Previous Dues: ₹${previousDues}`);
        console.log(`[Billing] Extra Amount from Entries: ₹${totalExtraAmount}`);
        // Final amount calculation: Product total + Previous dues (if any)
        // NO GST, NO TAXES - prices are final
        // Formula: (quantity × price) + previous_dues
        const gstAmount = 0;
        const finalAmount = totalAmount + previousDues;
        console.log(`[Billing] Final Amount: ₹${finalAmount} (No GST, No Taxes - Simple: qty × price + previous dues)`);
        console.log(`[Billing] ====================================`);
        const dueDate = new Date(year, month, 15).toISOString().split('T')[0]; // 15th of next month
        let billId;
        let billStatus = 'draft';
        if (existingBill) {
            // Update existing bill
            billId = existingBill.id;
            // Preserve status if bill is already issued or paid (don't revert to draft)
            const currentStatus = existingBill.status;
            if (currentStatus === 'issued' || currentStatus === 'paid' || currentStatus === 'overdue') {
                billStatus = currentStatus;
            }
            else {
                // Reset to draft if it was cancelled or draft
                billStatus = 'draft';
            }
            // Delete old bill items
            await db('bill_items').where({ bill_id: billId }).delete();
            // Update bill with new amounts
            // Note: updated_at is automatically updated by MySQL ON UPDATE CURRENT_TIMESTAMP
            await db('bills')
                .where({ id: billId })
                .update({
                status: billStatus,
                total_amount: finalAmount,
                total_quantity: totalQuantity,
                previous_dues: previousDues,
                gst_amount: gstAmount,
                due_date: dueDate,
            });
        }
        else {
            // Create new bill
            billId = (0, crypto_1.randomUUID)();
            await db('bills').insert({
                id: billId,
                seller_id: sellerId,
                customer_id: customerId,
                month: params.month,
                year: params.year,
                status: billStatus,
                total_amount: finalAmount,
                total_quantity: totalQuantity,
                previous_dues: previousDues,
                gst_amount: gstAmount,
                due_date: dueDate,
            });
        }
        // Insert bill items
        for (const item of billItems) {
            await db('bill_items').insert({
                id: (0, crypto_1.randomUUID)(),
                bill_id: billId,
                ...item,
            });
        }
        // Get the bill with items
        const bill = await db('bills').where({ id: billId }).first();
        const items = await db('bill_items')
            .where({ bill_id: billId })
            .orderBy('service_date', 'asc');
        const billResponse = {
            ...this.mapBillRow(bill),
            items: items.map((item) => ({
                id: item.id,
                productId: item.product_id,
                serviceDate: item.service_date,
                quantity: Number(item.quantity),
                unitPrice: Number(item.unit_price),
                totalPrice: Number(item.total_price),
                metadata: item.metadata ? JSON.parse(item.metadata) : null,
            })),
        };
        console.log(`[Billing] Returning bill: ID=${billId}, TotalAmount=₹${billResponse.totalAmount}, Items=${billResponse.items.length}`);
        return billResponse;
    }
    async issueBill(billId) {
        const db = (0, connection_1.getDb)();
        const bill = await db('bills').where({ id: billId }).first();
        if (!bill) {
            throw new errorHandler_1.ApiError('Bill not found', 404);
        }
        await db('bills')
            .where({ id: billId })
            .update({
            status: 'issued',
            issued_at: db.fn.now(),
            updated_at: db.fn.now(),
        });
        const updated = await db('bills').where({ id: billId }).first();
        return this.mapBillRow(updated);
    }
    async update(billId, payload) {
        const data = zod_1.z.object({ notes: zod_1.z.string().optional(), adjustments: zod_1.z.array(zod_1.z.any()).optional() }).parse(payload);
        const db = (0, connection_1.getDb)();
        const bill = await db('bills').where({ id: billId }).first();
        if (!bill) {
            throw new errorHandler_1.ApiError('Bill not found', 404);
        }
        await db('bills')
            .where({ id: billId })
            .update({
            notes: data.notes ?? bill.notes,
            updated_at: db.fn.now(),
        });
        const updated = await db('bills').where({ id: billId }).first();
        return this.mapBillRow(updated);
    }
    async sendReminder(billId, payload) {
        reminderSchema.parse(payload);
        const db = (0, connection_1.getDb)();
        const bill = await db('bills as b')
            .leftJoin('customers as c', 'b.customer_id', 'c.id')
            .leftJoin('users as u', 'c.user_id', 'u.id')
            .select('b.*', 'c.name as customer_name', 'u.mobile as customer_mobile', 'u.id as user_id')
            .where('b.id', billId)
            .first();
        if (!bill) {
            throw new errorHandler_1.ApiError('Bill not found', 404);
        }
        // Send FCM push notification
        if (bill.user_id) {
            try {
                // Dynamic import to avoid circular dependencies
                // @ts-ignore - Dynamic import for optional notification service
                const notificationModule = await import('../notifications/notification.service');
                const notificationService = notificationModule.notificationService;
                const monthName = new Date(parseInt(bill.year), parseInt(bill.month) - 1).toLocaleString('default', { month: 'long' });
                await notificationService.sendToUser(bill.user_id, 'Bill Payment Reminder', `Your bill for ${monthName} ${bill.year} (₹${Number(bill.total_amount).toFixed(2)}) is pending. Please make the payment.`, {
                    type: 'bill_reminder',
                    billId: billId,
                    amount: bill.total_amount.toString(),
                    month: bill.month,
                    year: bill.year,
                });
            }
            catch (error) {
                console.error(`[Billing] Error sending FCM notification for bill ${billId}:`, error);
                // Don't throw error, just log it - notification sending is not critical
            }
        }
        return { id: billId, message: 'Reminder sent' };
    }
    async markPaid(billId, payload) {
        const data = paymentSchema.parse(payload);
        const db = (0, connection_1.getDb)();
        const bill = await db('bills').where({ id: billId }).first();
        if (!bill) {
            throw new errorHandler_1.ApiError('Bill not found', 404);
        }
        if (bill.status === 'paid') {
            throw new errorHandler_1.ApiError('Bill already marked as paid', 400);
        }
        await db('bills')
            .where({ id: billId })
            .update({
            status: 'paid',
            updated_at: db.fn.now(),
        });
        // Create payment record
        await db('payments').insert({
            id: (0, crypto_1.randomUUID)(),
            bill_id: billId,
            seller_id: bill.seller_id,
            customer_id: bill.customer_id,
            amount: bill.total_amount,
            mode: data.mode,
            reference: data.reference ?? null,
            attachment_url: data.attachmentUrl ?? null,
            status: 'approved',
            confirmed_at: db.fn.now(),
        });
        const updated = await db('bills').where({ id: billId }).first();
        return { ...this.mapBillRow(updated), paymentMode: data.mode };
    }
    async markUnpaid(billId) {
        const db = (0, connection_1.getDb)();
        const bill = await db('bills').where({ id: billId }).first();
        if (!bill) {
            throw new errorHandler_1.ApiError('Bill not found', 404);
        }
        if (bill.status !== 'paid') {
            throw new errorHandler_1.ApiError('Bill is not marked as paid', 400);
        }
        await db('bills')
            .where({ id: billId })
            .update({
            status: 'issued',
            updated_at: db.fn.now(),
        });
        // Mark payment as cancelled
        await db('payments')
            .where({ bill_id: billId })
            .update({
            status: 'cancelled',
            updated_at: db.fn.now(),
        });
        const updated = await db('bills').where({ id: billId }).first();
        return this.mapBillRow(updated);
    }
    async listBills(sellerId, filters) {
        const db = (0, connection_1.getDb)();
        const query = db('bills as b')
            .leftJoin('customers as c', 'b.customer_id', 'c.id')
            .select('b.*', 'c.name as customer_name', 'c.mobile as customer_mobile')
            .where('b.seller_id', sellerId);
        if (filters?.year) {
            query.where('b.year', filters.year);
        }
        if (filters?.month) {
            query.where('b.month', filters.month);
        }
        if (filters?.status) {
            query.where('b.status', filters.status);
        }
        if (filters?.customerId) {
            query.where('b.customer_id', filters.customerId);
        }
        const rows = await query.orderBy('b.year', 'desc').orderBy('b.month', 'desc').orderBy('b.created_at', 'desc');
        return rows.map((row) => ({
            ...this.mapBillRow(row),
            customerName: row.customer_name,
            customerMobile: row.customer_mobile,
        }));
    }
    async generateMonthlyBillsForSeller(sellerId, month, year) {
        const db = (0, connection_1.getDb)();
        const customers = await db('customers')
            .where({ seller_id: sellerId, active: true })
            .whereNull('exited_at');
        const results = [];
        for (const customer of customers) {
            try {
                const bill = await this.generate(sellerId, customer.id, { month, year });
                if (bill) {
                    await this.issueBill(bill.id);
                    results.push({ customerId: customer.id, billId: bill.id, success: true });
                }
            }
            catch (error) {
                results.push({
                    customerId: customer.id,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }
        return { month, year, results };
    }
    /**
     * Generate monthly bills for all sellers for a specific month/year
     * This is called by a cron job to automatically generate bills
     */
    async generateMonthlyBillsForAllSellers(month, year) {
        const db = (0, connection_1.getDb)();
        const sellers = await db('sellers')
            .where({ status: 'Active' })
            .select('id');
        const allResults = [];
        for (const seller of sellers) {
            try {
                const result = await this.generateMonthlyBillsForSeller(seller.id, month, year);
                allResults.push({
                    sellerId: seller.id,
                    ...result,
                });
            }
            catch (error) {
                allResults.push({
                    sellerId: seller.id,
                    month,
                    year,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }
        return {
            month,
            year,
            sellersProcessed: sellers.length,
            results: allResults,
        };
    }
    async getBillWithItems(billId) {
        const db = (0, connection_1.getDb)();
        try {
            // First get the bill with customer info (similar to listBills which works)
            const bill = await db('bills as b')
                .leftJoin('customers as c', 'b.customer_id', 'c.id')
                .select('b.*', 'c.name as customer_name', 'c.mobile as customer_mobile', 'c.address_line1 as customer_address')
                .where('b.id', billId)
                .first();
            if (!bill) {
                throw new errorHandler_1.ApiError('Bill not found', 404);
            }
            // Get seller info separately if needed
            let sellerInfo = null;
            if (bill.seller_id) {
                sellerInfo = await db('sellers')
                    .where('id', bill.seller_id)
                    .select('business_name', 'contact_phone', 'contact_email')
                    .first();
            }
            const items = await db('bill_items')
                .where({ bill_id: billId })
                .orderBy('service_date', 'asc');
            return {
                ...this.mapBillRow(bill),
                customerName: bill.customer_name || null,
                customerMobile: bill.customer_mobile || null,
                customerAddress: bill.customer_address || null,
                sellerName: sellerInfo?.business_name || 'Seller',
                sellerBusiness: sellerInfo?.business_name || null,
                sellerMobile: sellerInfo?.contact_phone || null,
                items: items.map((item) => ({
                    id: item.id,
                    productId: item.product_id || null,
                    serviceDate: item.service_date,
                    quantity: Number(item.quantity || 0),
                    unitPrice: Number(item.unit_price || 0),
                    totalPrice: Number(item.total_price || 0),
                    metadata: item.metadata ? (typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata) : null,
                })),
            };
        }
        catch (error) {
            console.error(`[Billing] Error fetching bill with items for billId ${billId}:`, error);
            if (error.message && error.message.includes('Unknown column')) {
                throw new errorHandler_1.ApiError(`Database error: ${error.message}`, 500);
            }
            throw error;
        }
    }
    async getBillDetails(billId) {
        const db = (0, connection_1.getDb)();
        const row = await db('bills as b')
            .leftJoin('customers as c', 'b.customer_id', 'c.id')
            .leftJoin('sellers as s', 'b.seller_id', 's.id')
            .select('b.*', 'c.name as customer_name', 'c.mobile as customer_mobile', 'c.address_line1 as customer_address', 's.name as seller_name', 's.business_name as seller_business', 's.mobile as seller_mobile')
            .where('b.id', billId)
            .first();
        if (!row) {
            throw new errorHandler_1.ApiError('Bill not found', 404);
        }
        return {
            ...this.mapBillRow(row),
            customerName: row.customer_name,
            customerMobile: row.customer_mobile,
            customerAddress: row.customer_address,
            sellerName: row.seller_name || row.seller_business || 'Seller',
            sellerBusiness: row.seller_business,
            sellerMobile: row.seller_mobile,
        };
    }
    async deleteBill(billId) {
        const db = (0, connection_1.getDb)();
        // Check if bill exists
        const bill = await db('bills').where({ id: billId }).first();
        if (!bill) {
            throw new errorHandler_1.ApiError('Bill not found', 404);
        }
        // Delete bill items first (cascade should handle this, but being explicit)
        await db('bill_items').where({ bill_id: billId }).delete();
        // Delete the bill
        await db('bills').where({ id: billId }).delete();
        console.log(`[Billing] Bill ${billId} deleted successfully`);
    }
    async generateInvoicePdf(billId) {
        const db = (0, connection_1.getDb)();
        const bill = await this.getBillDetails(billId);
        const items = await db('bill_items')
            .where({ bill_id: billId })
            .orderBy('service_date', 'asc');
        const doc = new pdfkit_1.default({ margin: 50 });
        doc.fontSize(22).text('Milkman Monthly Invoice', { align: 'center' });
        doc.moveDown();
        doc
            .fontSize(12)
            .text(`Invoice ID: ${bill.id}`)
            .text(`Billing Period: ${bill.month}/${bill.year}`)
            .text(`Status: ${bill.status.toUpperCase()}`)
            .moveDown();
        doc.fontSize(14).text('Seller', { underline: true });
        doc
            .fontSize(12)
            .text(bill.sellerName || 'Seller')
            .text(bill.sellerMobile ? `Contact: ${bill.sellerMobile}` : '')
            .moveDown();
        doc.fontSize(14).text('Customer', { underline: true });
        doc
            .fontSize(12)
            .text(bill.customerName || 'Customer')
            .text(bill.customerMobile ? `Phone: ${bill.customerMobile}` : '')
            .text(bill.customerAddress || '')
            .moveDown();
        doc.fontSize(14).text('Line Items', { underline: true }).moveDown(0.5);
        doc.fontSize(12);
        if (items.length === 0) {
            doc.text('No line items available for this invoice.');
        }
        else {
            items.forEach((item) => {
                const metadata = item.metadata ? JSON.parse(item.metadata) : {};
                const productName = metadata.product_name || 'Milk Delivery';
                const dateLabel = item.service_date
                    ? new Date(item.service_date).toLocaleDateString('en-IN')
                    : 'N/A';
                doc
                    .text(`${dateLabel} - ${productName}`, { continued: true })
                    .text(`  Qty: ${Number(item.quantity).toFixed(2)} @ ₹${Number(item.unit_price).toFixed(2)}  Total: ₹${Number(item.total_price).toFixed(2)}`);
            });
        }
        doc.moveDown();
        doc.fontSize(14).text('Summary', { underline: true });
        doc.fontSize(12);
        const subtotal = bill.totalAmount - bill.previousDues;
        doc.text(`Total Quantity: ${bill.totalQuantity.toFixed(2)} Litre(s)`);
        doc.text(`Subtotal: ₹${subtotal.toFixed(2)}`);
        if (bill.previousDues > 0) {
            doc.text(`Previous Dues: ₹${bill.previousDues.toFixed(2)}`);
        }
        doc.text(`Grand Total: ₹${bill.totalAmount.toFixed(2)}`, { underline: true });
        doc.moveDown(2).fontSize(10).text('Generated by Milkman Platform', { align: 'center' });
        // Collect PDF buffer using PDFKit's built-in method
        const chunks = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        return new Promise((resolve, reject) => {
            doc.on('end', () => {
                const buffer = Buffer.concat(chunks);
                const filename = `invoice-${bill.year}-${bill.month}-${(bill.customerName || 'customer')
                    .toLowerCase()
                    .replace(/\s+/g, '-')}.pdf`;
                resolve({ buffer, filename });
            });
            doc.on('error', reject);
            doc.end();
        });
    }
}
exports.billingService = new BillingService();
//# sourceMappingURL=billing.service.js.map