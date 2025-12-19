import { z } from 'zod';
import { randomUUID } from 'crypto';
import { getDb } from '../../database/connection.js';
import { ApiError } from '../../utils/errorHandler.js';

const planInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.number().positive('Amount must be greater than zero'),
  planType: z.enum(['Monthly', 'Yearly'], { message: 'Invalid plan type' }),
});

const planResponse = (row) => ({
  id: row.id,
  name: row.name,
  amount: Number(row.price),
  planType: row.billing_cycle === 'yearly' ? 'Yearly' : 'Monthly',
  customerLimit: row.customer_limit ?? null,
  productLimit: row.product_limit ?? null,
  description: row.description ?? null,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  deletedAt: row.deleted_at,
});

class SubscriptionService {
  async listPlans() {
    const db = getDb();
    const hasDeletedAt = await db.schema.hasColumn('subscription_plans', 'deleted_at');
    const columns = [
      'id',
      'name',
      'price',
      'billing_cycle',
      'customer_limit',
      'product_limit',
      'description',
      'created_at',
      'updated_at',
    ];

    if (hasDeletedAt) {
      columns.push('deleted_at');
    }

    const rows = await db('subscription_plans').select(columns).orderBy('created_at', 'desc');

    return rows.map((row) => planResponse({ ...row, deleted_at: hasDeletedAt ? row.deleted_at : null }));
  }

  async createPlan(payload) {
    const data = planInputSchema.parse(payload);
    const db = getDb();
    const planId = randomUUID();
    
    await db('subscription_plans').insert({
      id: planId,
      name: data.name,
      price: data.amount,
      billing_cycle: data.planType.toLowerCase(),
    });

    // MySQL doesn't support .returning(), so fetch the created plan
    const plan = await db('subscription_plans').where({ id: planId }).first();
    
    if (!plan) {
      throw new ApiError('Failed to create subscription plan', 500);
    }

    return planResponse(plan);
  }

  async updatePlan(planId, payload) {
    const data = planInputSchema.partial().parse(payload);
    if (!Object.keys(data).length) {
      throw new ApiError('No changes provided', 400);
    }

    const db = getDb();
    const existing = await db('subscription_plans').where({ id: planId }).first();
    if (!existing) {
      throw new ApiError('Plan not found', 404);
    }

    const updatePayload = {};
    if (typeof data.name !== 'undefined') {
      updatePayload.name = data.name;
    }
    if (typeof data.amount !== 'undefined') {
      updatePayload.price = data.amount;
    }
    if (typeof data.planType !== 'undefined') {
      updatePayload.billing_cycle = data.planType.toLowerCase();
    }

    await db('subscription_plans')
      .where({ id: planId })
      .update({
        ...updatePayload,
        updated_at: db.fn.now(),
      });

    // MySQL doesn't support .returning(), so fetch the updated plan
    const updated = await db('subscription_plans').where({ id: planId }).first();
    
    if (!updated) {
      throw new ApiError('Plan not found after update', 404);
    }

    return planResponse(updated);
  }

  async softDeletePlan(planId) {
    const db = getDb();
    const hasDeletedAt = await db.schema.hasColumn('subscription_plans', 'deleted_at');
    if (!hasDeletedAt) {
      throw new ApiError(
        'Soft delete requires subscription_plans.deleted_at; run latest migrations first.',
        400,
      );
    }

    const updated = await db('subscription_plans')
      .where({ id: planId })
      .update({ deleted_at: db.fn.now() }, '*');

    if (!updated.length) {
      throw new ApiError('Plan not found', 404);
    }

    return planResponse(updated[0]);
  }

  async assignPlan(sellerId, payload) {
    const data = z
      .object({ planId: z.string().uuid(), paymentReference: z.string().optional() })
        .parse(payload);
    return { sellerId, ...data, status: 'active' };
  }
}

export const subscriptionService = new SubscriptionService();
