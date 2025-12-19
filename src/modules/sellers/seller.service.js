import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { ApiError } from '../../utils/errorHandler.js';
import { getDb } from '../../database/connection.js';

const profileSchema = z.object({
  name: z.string().optional(),
  contactEmail: z.string().email().optional(),
  subscriptionPlanId: z.string().optional(),
});

const updateSellerSchema = z.object({
  name: z.string().min(2, 'Name is required').optional(),
  businessName: z.string().min(2, 'Business name is required').optional(),
  mobile: z.string().regex(/^\d{10}$/, 'Mobile number must be 10 digits').optional(),
  status: z.enum(['Active', 'Pending', 'Inactive']).optional(),
  subscriptionPlanId: z
    .string()
    .trim()
    .refine((value) => !value || value.length >= 4, {
      message: 'Invalid subscription plan reference',
    })
    .optional()
    .nullable(),
  whatsappAvailable: z.boolean().optional(),
  email: z.string().email().optional(),
});

const createSellerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  businessName: z.string().min(2, 'Business name is required'),
  mobile: z.string().regex(/^\d{10}$/, 'Mobile number must be 10 digits'),
  status: z.enum(['Active', 'Pending', 'Inactive']).default('Pending'),
  subscriptionPlanId: z
    .string()
    .trim()
    .min(1, 'Subscription plan is required')
    .refine((value) => value && value.length >= 4, {
      message: 'Invalid subscription plan reference',
    }),
  whatsappAvailable: z.boolean().optional(),
  email: z.string().email().optional(),
});

const listSellersSchema = z.object({
  status: z.enum(['Active', 'Pending', 'Inactive']).optional(),
  search: z.string().optional(),
});

const sellerStatusMap = {
  Active: 'active',
  Pending: 'pending',
  Inactive: 'suspended',
};

const sellerDisplayStatusMap = {
  pending: 'Pending',
  active: 'Active',
  suspended: 'Inactive',
};

const generatePin = () => (Math.floor(100000 + Math.random() * 900000)).toString();

class SellerService {
  async recordSubscriptionHistory(trx, sellerId, oldPlanId, newPlanId, changedBy) {
    await trx('seller_subscription_history').insert({
      id: randomUUID(),
      seller_id: sellerId,
      old_plan_id: oldPlanId,
      new_plan_id: newPlanId,
      changed_by: changedBy ?? null,
    });
  }

  async createSellerSubscription(trx, sellerId, planId, oldPlanId = null, changedBy) {
    const subscriptionId = randomUUID();
    console.log(`[createSellerSubscription] Inserting subscription ${subscriptionId} for seller ${sellerId}, plan ${planId}`);
    
    await trx('seller_subscriptions').insert({
      id: subscriptionId,
      seller_id: sellerId,
      plan_id: planId,
      starts_at: trx.fn.now(),
      ends_at: trx.fn.now(),
      status: 'active',
    });
    
    console.log(`[createSellerSubscription] Subscription ${subscriptionId} inserted successfully`);
    
    // Record history with the correct old plan ID
    await this.recordSubscriptionHistory(trx, sellerId, oldPlanId, planId, changedBy);
    console.log(`[createSellerSubscription] History recorded for seller ${sellerId} (old: ${oldPlanId}, new: ${planId})`);
  }

  async listSellers(filters) {
    const params = listSellersSchema.parse(filters ?? {});
    const db = getDb();

    const query = db('sellers as s')
      .leftJoin('users as u', 's.user_id', 'u.id')
      .leftJoin('subscription_plans as sp', 's.subscription_plan_id', 'sp.id')
      .select(
        's.id',
        's.business_name',
        's.status as seller_status',
        's.subscription_plan_id',
        'u.name as user_name',
        'u.mobile as user_mobile',
        'sp.name as plan_name',
      );

    if (params.status) {
      query.where('s.status', sellerStatusMap[params.status]);
    }

    if (params.search) {
      query.andWhere((builder) => {
        builder
          .whereILike('u.name', `%${params.search}%`)
          .orWhereILike('s.business_name', `%${params.search}%`)
          .orWhere('u.mobile', 'like', `%${params.search}%`);
      });
    }

    const rows = await query.orderBy('s.created_at', 'desc');

    return rows.map((row) => {
      const rawStatus = row.seller_status;
      let statusKey = 'pending';

      if (rawStatus === 'active' || rawStatus === 'suspended' || rawStatus === 'pending') {
        statusKey = rawStatus;
      }

      return {
        id: row.id,
        name: row.user_name,
        businessName: row.business_name,
        mobile: row.user_mobile,
        status: sellerDisplayStatusMap[statusKey],
        subscriptionPlanId: row.subscription_plan_id,
        subscriptionPlanName: row.plan_name || null,
      };
    });
  }

  async getDashboard(sellerId) {
    if (!sellerId) {
      throw new ApiError('Seller id is required', 400);
    }

    const db = getDb();

    const seller = await db('sellers as s')
      .leftJoin('subscription_plans as sp', 's.subscription_plan_id', 'sp.id')
      .select(
        's.id',
        's.business_name',
        's.status',
        'sp.name as plan_name',
        'sp.price as plan_price',
        'sp.billing_cycle',
      )
      .where('s.id', sellerId)
      .first();

    if (!seller) {
      throw new ApiError('Seller not found', 404);
    }

    const customerCountRow = await db('customers')
      .where({ seller_id: sellerId })
      .count('id as count')
      .first();
    const customersCount = Number(customerCountRow?.count ?? 0);

    const now = new Date();
    const currentMonth = `${now.getUTCMonth() + 1}`.padStart(2, '0');
    const currentYear = `${now.getUTCFullYear()}`;

    const currentMonthBillRow = await db('seller_subscription_collections')
      .where({ seller_id: sellerId, month: currentMonth, year: currentYear })
      .sum('amount as sum')
      .first();

    const currentMonthPaidRow = await db('seller_subscription_collections')
      .where({ seller_id: sellerId, month: currentMonth, year: currentYear, status: 'paid' })
      .sum('amount as sum')
      .first();

    const pendingAmountRow = await db('seller_subscription_collections')
      .where({ seller_id: sellerId })
      .whereIn('status', ['pending', 'overdue'])
      .sum('amount as sum')
      .first();

    // Get pending bills count and amount
    const pendingBillsRow = await db('bills')
      .where({ seller_id: sellerId })
      .whereIn('status', ['issued', 'overdue'])
      .select(
        db.raw('COUNT(id) as count'),
        db.raw('SUM(total_amount) as sum')
      )
      .first();

    const pendingBillsCount = Number(pendingBillsRow?.count ?? 0);
    const pendingBillsAmount = Number(pendingBillsRow?.sum ?? 0);

    // Get monthly consumption summary
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const monthStartStr = monthStart.toISOString().split('T')[0];
    const monthEndStr = monthEnd.toISOString().split('T')[0];

    const monthlyConsumptionRow = await db('daily_entries')
      .where({ seller_id: sellerId })
      .whereBetween('entry_date', [monthStartStr, monthEndStr])
      .where('delivered', true)
      .select(
        db.raw('SUM(quantity) as sum'),
        db.raw('COUNT(id) as count')
      )
      .first();

    const monthlyConsumption = Number(monthlyConsumptionRow?.sum ?? 0);
    const monthlyDeliveries = Number(monthlyConsumptionRow?.count ?? 0);

    const recentCollections = await db('seller_subscription_collections')
      .where({ seller_id: sellerId })
      .orderBy('due_date', 'desc')
      .limit(5)
      .select(
        'id',
        'month',
        'year',
        'amount',
        'status',
        'due_date',
        'paid_at',
        'payment_mode',
        'reference',
      );

    const upcomingCollections = await db('seller_subscription_collections')
      .where({ seller_id: sellerId })
      .whereIn('status', ['pending', 'overdue'])
      .orderBy('due_date', 'asc')
      .limit(3)
      .select('id', 'month', 'year', 'amount', 'status', 'due_date');

    const recentCustomers = await db('customers')
      .where({ seller_id: sellerId })
      .select('id', 'name', 'mobile', 'created_at')
      .orderBy('created_at', 'desc')
      .limit(5);

    return {
      sellerId,
      sellerName: seller.business_name,
      plan: seller.plan_name
        ? {
            name: seller.plan_name,
            amount: seller.plan_price ? Number(seller.plan_price) : null,
            billingCycle: seller.billing_cycle,
          }
        : null,
      metrics: {
        totalCustomers: customersCount,
        currentMonthBill: Number(currentMonthBillRow?.sum ?? 0),
        currentMonthPaid: Number(currentMonthPaidRow?.sum ?? 0),
        pendingAmount: Number(pendingAmountRow?.sum ?? 0),
        pendingBillsCount,
        pendingBillsAmount,
        monthlyConsumption,
        monthlyDeliveries,
      },
      upcomingCollections: upcomingCollections.map((row) => ({
        id: row.id,
        month: row.month,
        year: row.year,
        amount: Number(row.amount),
        status: row.status,
        dueDate: row.due_date,
      })),
      recentCollections: recentCollections.map((row) => ({
        id: row.id,
        month: row.month,
        year: row.year,
        amount: Number(row.amount),
        status: row.status,
        dueDate: row.due_date,
        paidAt: row.paid_at,
        paymentMode: row.payment_mode,
        reference: row.reference,
      })),
      recentCustomers: recentCustomers.map((row) => ({
        id: row.id,
        name: row.name,
        mobile: row.mobile,
        joinedAt: row.created_at,
      })),
    };
  }

  async updateProfile(sellerId, payload) {
    const data = profileSchema.parse(payload);
    // TODO: update seller profile
    return { sellerId, ...data };
  }

  async updateSeller(sellerId, payload) {
    const data = updateSellerSchema.parse(payload);
    const db = getDb();

    // Get seller with user info
    const seller = await db('sellers as s')
      .leftJoin('users as u', 's.user_id', 'u.id')
      .select('s.*', 'u.id as user_id', 'u.mobile as user_mobile', 'u.name as user_name')
      .where('s.id', sellerId)
      .first();

    if (!seller) {
      throw new ApiError('Seller not found', 404);
    }

    const userId = seller.user_id;
    const oldPlanId = seller.subscription_plan_id;
    // Handle subscriptionPlanId: if provided and not empty after trim, use it; otherwise null
    const newPlanId = data.subscriptionPlanId && data.subscriptionPlanId.trim() 
      ? data.subscriptionPlanId.trim() 
      : null;
    
    console.log(`[updateSeller] Plan check - oldPlanId: ${oldPlanId}, newPlanId: ${newPlanId}, raw: ${data.subscriptionPlanId}`);

    // Check if mobile is being changed and if it's already taken
    if (data.mobile && data.mobile !== seller.user_mobile) {
      const existingUser = await db('users').where({ mobile: data.mobile }).whereNot('id', userId).first();
      if (existingUser) {
        throw new ApiError('A user with this mobile number already exists', 409);
      }
    }

    const trx = await db.transaction();

    try {
      // Update user if name or mobile changed
      const userUpdates = {};
      if (data.name !== undefined) {
        userUpdates.name = data.name;
      }
      if (data.mobile !== undefined) {
        userUpdates.mobile = data.mobile;
      }
      if (data.email !== undefined) {
        userUpdates.email = data.email;
      }
      if (Object.keys(userUpdates).length > 0) {
        await trx('users').where({ id: userId }).update(userUpdates);
      }

      // Update seller
      const sellerUpdates = {};
      if (data.businessName !== undefined) {
        sellerUpdates.business_name = data.businessName;
      }
      if (data.mobile !== undefined) {
        sellerUpdates.contact_phone = data.mobile;
      }
      if (data.status !== undefined) {
        sellerUpdates.status = sellerStatusMap[data.status] ?? seller.status;
      }
      if (data.email !== undefined) {
        sellerUpdates.contact_email = data.email;
      }
      if (data.whatsappAvailable !== undefined) {
        const currentMetadata = seller.metadata ? JSON.parse(seller.metadata) : {};
        sellerUpdates.metadata = JSON.stringify({
          ...currentMetadata,
          whatsappAvailable: data.whatsappAvailable,
        });
      }
      if (Object.keys(sellerUpdates).length > 0) {
        sellerUpdates.updated_at = trx.fn.now();
        await trx('sellers').where({ id: sellerId }).update(sellerUpdates);
      }

      // Handle subscription plan change
      // Scenarios:
      // 1. No plan → Plan: Create new subscription, record history (old=null, new=planId) ✅ WORKS
      // 2. Plan → Different Plan: Expire old, create new, record history ✅ WORKS
      // 3. Plan → No plan: Expire old, set seller to trial, record history ✅ WORKS
      // 4. No plan → No plan: Only error if explicitly trying to set plan to null
      
      // If seller has no plan, only require a plan if subscriptionPlanId is explicitly provided in payload
      // If subscriptionPlanId is not in payload, allow updating other fields without requiring plan
      const planProvidedInPayload = 'subscriptionPlanId' in data;
      
      // Only error if: seller has no plan AND update explicitly tries to set plan to null/empty
      // This means: if subscriptionPlanId is in payload but is null/empty, that's an error
      // But if subscriptionPlanId is not in payload at all, allow updating other fields
      if (!oldPlanId && planProvidedInPayload && !newPlanId) {
        console.log(`[updateSeller] Error: Seller has no plan (oldPlanId: ${oldPlanId}), update explicitly provided subscriptionPlanId but it's empty/null (newPlanId: ${newPlanId}, raw: ${data.subscriptionPlanId})`);
        await trx.rollback();
        throw new ApiError('Seller has no subscription plan. Please select a subscription plan when updating this seller.', 400);
      }
      
      // If seller has no plan and subscriptionPlanId is not in payload, allow updating other fields
      if (!oldPlanId && !planProvidedInPayload) {
        console.log(`[updateSeller] Seller has no plan but subscriptionPlanId not in payload - allowing update of other fields`);
      }

      // Handle plan changes (including: No plan → Plan assignment)
      if (oldPlanId !== newPlanId) {
        if (oldPlanId) {
          // Expire current subscription (scenario 2 or 3: Plan → Plan or Plan → No plan)
          const currentSubscription = await trx('seller_subscriptions')
            .where({ seller_id: sellerId, status: 'active' })
            .orderBy('starts_at', 'desc')
            .first();

          if (currentSubscription) {
            await trx('seller_subscriptions')
              .where({ id: currentSubscription.id })
              .update({
                status: 'expired',
                ends_at: trx.fn.now(),
                updated_at: trx.fn.now(),
              });
          }
        }

        if (newPlanId) {
          // Assigning a plan (scenario 1: No plan → Plan OR scenario 2: Plan → Different Plan)
          // Verify the plan exists
          const planExists = await trx('subscription_plans')
            .where({ id: newPlanId })
            .first();

          if (!planExists) {
            await trx.rollback();
            throw new ApiError(`Subscription plan with ID ${newPlanId} not found`, 400);
          }

          // Create new subscription (creates both seller_subscriptions and history records)
          // For scenario 1 (No plan → Plan): oldPlanId will be null, which is correct
          console.log(`[updateSeller] Assigning plan to seller - oldPlanId: ${oldPlanId}, newPlanId: ${newPlanId}`);
          await this.createSellerSubscription(trx, sellerId, newPlanId, oldPlanId, undefined);
          console.log(`[updateSeller] Subscription created successfully for seller ${sellerId}`);

          // Update seller's subscription_plan_id
          await trx('sellers')
            .where({ id: sellerId })
            .update({
              subscription_plan_id: newPlanId,
              subscription_status: 'active',
              updated_at: trx.fn.now(),
            });
        } else {
          // Removing plan (scenario 3: Plan → No plan) - only allowed if seller had a plan
          await trx('sellers')
            .where({ id: sellerId })
            .update({
              subscription_plan_id: null,
              subscription_status: 'trial',
              updated_at: trx.fn.now(),
            });

          // Record history for plan removal
          await this.recordSubscriptionHistory(trx, sellerId, oldPlanId, null, undefined);
        }
      }

      await trx.commit();
      console.log(`[updateSeller] Seller ${sellerId} updated successfully`);

      // Return updated seller
      const updatedSeller = await db('sellers as s')
        .leftJoin('users as u', 's.user_id', 'u.id')
        .leftJoin('subscription_plans as sp', 's.subscription_plan_id', 'sp.id')
        .select(
          's.id',
          's.business_name',
          's.status as seller_status',
          's.subscription_plan_id',
          'u.name as user_name',
          'u.mobile as user_mobile',
          'sp.name as plan_name',
        )
        .where('s.id', sellerId)
        .first();

      const rawStatus = updatedSeller.seller_status;
      let statusKey = 'pending';
      if (rawStatus === 'active' || rawStatus === 'suspended' || rawStatus === 'pending') {
        statusKey = rawStatus;
      }

      return {
        id: updatedSeller.id,
        name: updatedSeller.user_name,
        businessName: updatedSeller.business_name,
        mobile: updatedSeller.user_mobile,
        status: sellerDisplayStatusMap[statusKey],
        subscriptionPlanId: updatedSeller.subscription_plan_id,
        subscriptionPlanName: updatedSeller.plan_name || null,
      };
    } catch (error) {
      await trx.rollback();
      console.error('Failed to update seller', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? `Unable to update seller: ${error.message}` : 'Unable to update seller',
        500,
      );
    }
  }

  async listCustomers(sellerId, filters) {
    if (!sellerId) {
      throw new ApiError('Seller id is required', 400);
    }
    // TODO: fetch customers applying filters
    return [];
  }

  async getAnalytics(sellerId) {
    if (!sellerId) {
      throw new ApiError('Seller id is required', 400);
    }
    return {
      monthlySales: [],
      collectionVsPending: [],
      topCustomers: [],
      productConsumption: [],
      subscriptionDaysRemaining: 0,
    };
  }

  async createSeller(payload) {
    const data = createSellerSchema.parse(payload);
    const db = getDb();

    const existingUser = await db('users').where({ mobile: data.mobile }).first();
    if (existingUser) {
      throw new ApiError('A user with this mobile number already exists', 409);
    }

    const pin = generatePin();
    const pinHash = await bcrypt.hash(pin, 10);

    const userId = randomUUID();
    const sellerId = randomUUID();
    const contactEmail = data.email ?? `seller${data.mobile}@milkman.test`;
    const preferWhatsApp = data.whatsappAvailable ?? false;
    const subscriptionPlanId = data.subscriptionPlanId.trim();

    const trx = await db.transaction();

    const dbStatus = sellerStatusMap[data.status] ?? 'pending';

    try {
      // Verify the plan exists BEFORE creating user/seller
      const planExists = await trx('subscription_plans')
        .where({ id: subscriptionPlanId })
        .first();
      
      if (!planExists) {
        await trx.rollback();
        throw new ApiError(`Subscription plan with ID ${subscriptionPlanId} not found`, 400);
      }

      await trx('users').insert({
        id: userId,
        name: data.name,
        email: contactEmail,
        mobile: data.mobile,
        pin_hash: pinHash,
        role: 'seller',
        status: 'active',
        last_login_at: trx.fn.now(),
      });

      await trx('sellers').insert({
        id: sellerId,
        user_id: userId,
        business_name: data.businessName,
        contact_email: contactEmail,
        contact_phone: data.mobile,
        status: dbStatus,
        billing_cycle_anchor: trx.fn.now(),
        subscription_plan_id: subscriptionPlanId,
        subscription_status: 'active',
        metadata: JSON.stringify({
          whatsappAvailable: preferWhatsApp,
        }),
      });

      // ALWAYS create subscription record and history (plan is now required)
      console.log(`[createSeller] Creating subscription for seller ${sellerId} with plan ${subscriptionPlanId}`);
      await this.createSellerSubscription(trx, sellerId, subscriptionPlanId, null, undefined);
      console.log(`[createSeller] Subscription created successfully for seller ${sellerId}`);

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      console.error('Failed to create seller', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? `Unable to create seller: ${error.message}` : 'Unable to create seller',
        500,
      );
    }

    const delivery = null;

    return {
      seller: {
        id: sellerId,
        name: data.name,
        businessName: data.businessName,
        mobile: data.mobile,
        status: sellerDisplayStatusMap[dbStatus],
        subscriptionPlanId,
      },
      user: {
        id: userId,
        mobile: data.mobile,
      },
      temporaryPin: pin,
      delivery,
    };
  }

  async updateSubscription(sellerId, payload) {
    const data = z
      .object({
        planId: z.string().min(1, 'Plan id required'),
        changedBy: z.string().uuid().optional(),
      })
      .parse(payload);

    const db = getDb();
    const seller = await db('sellers').where({ id: sellerId }).first();
    if (!seller) {
      throw new ApiError('Seller not found', 404);
    }
    const newPlanId = data.planId;

    const trx = await db.transaction();
    try {
      const currentSubscription = await trx('seller_subscriptions')
        .where({ seller_id: sellerId, status: 'active' })
        .orderBy('starts_at', 'desc')
        .first();

      const oldPlanId = currentSubscription?.plan_id ?? seller.subscription_plan_id ?? null;

      if (oldPlanId === newPlanId) {
        await trx.rollback();
        return { message: 'Plan unchanged' };
      }

      if (currentSubscription) {
        await trx('seller_subscriptions')
          .where({ id: currentSubscription.id })
          .update({
            status: 'expired',
            ends_at: trx.fn.now(),
            updated_at: trx.fn.now(),
          });
      }

      await trx('sellers')
        .where({ id: sellerId })
        .update({
          subscription_plan_id: newPlanId,
          subscription_status: 'active',
          updated_at: trx.fn.now(),
        });

      await trx('seller_subscriptions').insert({
        id: randomUUID(),
        seller_id: sellerId,
        plan_id: newPlanId,
        starts_at: trx.fn.now(),
        ends_at: trx.fn.now(),
        status: 'active',
      });

      await this.recordSubscriptionHistory(trx, sellerId, oldPlanId, newPlanId, data.changedBy);

      await trx.commit();
      return { message: 'Subscription updated' };
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  /**
   * Expire subscriptions that have passed their end date
   * This is called by a cron job to automatically expire subscriptions
   */
  async expireSubscriptions() {
    const db = getDb();
    try {
      // Find all active subscriptions that have passed their end date
      const expiredSubscriptions = await db('seller_subscriptions')
        .where({ status: 'active' })
        .whereRaw('ends_at < NOW()')
        .select('id', 'seller_id', 'plan_id');

      let expiredCount = 0;
      for (const subscription of expiredSubscriptions) {
        // Update subscription status to expired
        await db('seller_subscriptions')
          .where({ id: subscription.id })
          .update({
            status: 'expired',
            updated_at: db.fn.now(),
          });

        // Update seller's subscription status to trial if this was their active subscription
        const seller = await db('sellers')
          .where({ id: subscription.seller_id, subscription_plan_id: subscription.plan_id })
          .first();

        if (seller) {
          await db('sellers')
            .where({ id: subscription.seller_id })
            .update({
              subscription_status: 'trial',
              subscription_plan_id: null,
              updated_at: db.fn.now(),
            });
        }

        expiredCount++;
      }

      return { expiredCount, expiredSubscriptions: expiredSubscriptions.length };
    } catch (error) {
      console.error('[SellerService] Error expiring subscriptions:', error);
      throw error;
    }
  }
}

export const sellerService = new SellerService();
