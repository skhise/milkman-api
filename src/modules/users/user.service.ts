import { z } from 'zod';
import { getDb } from '../../database/connection';

const paymentSchema = z.object({
  mode: z.enum(['cash', 'online', 'bank', 'upi']),
  amount: z.number().positive(),
  attachmentUrl: z.string().optional(),
});

type SellerStatusDb = 'pending' | 'active' | 'suspended';

const sellerDisplayStatusMap: Record<SellerStatusDb, 'Pending' | 'Active' | 'Inactive'> = {
  pending: 'Pending',
  active: 'Active',
  suspended: 'Inactive',
};

class UserService {
  async dashboard(userId: string) {
    const db = getDb();

    const totalSellerRow = await db('sellers').count<{ count: string }>('id').first();
    const activeSellerRow = await db('sellers')
      .where({ status: 'active' })
      .count<{ count: string }>('id')
      .first();
    const pendingSellerRow = await db('sellers')
      .where({ status: 'pending' })
      .count<{ count: string }>('id')
      .first();

    const sellersWithPlansRow = await db('sellers')
      .whereNotNull('subscription_plan_id')
      .count<{ count: string }>('id')
      .first();

    const hasDeletedAtColumn = await db.schema.hasColumn('subscription_plans', 'deleted_at');
    let activePlansQuery = db('subscription_plans');

    if (hasDeletedAtColumn) {
      activePlansQuery = activePlansQuery.whereNull('deleted_at');
    }

    const activePlansRow = await activePlansQuery.count<{ count: string }>('id').first();

    const now = new Date();
    const currentMonth = `${now.getUTCMonth() + 1}`.padStart(2, '0');
    const currentYear = `${now.getUTCFullYear()}`;

    const paidThisMonthRow = await db('seller_subscription_collections')
      .where({ month: currentMonth, year: currentYear, status: 'paid' })
      .sum<{ sum: string | null }>('amount as sum')
      .first();

    const pendingAmountRow = await db('seller_subscription_collections')
      .where({ month: currentMonth, year: currentYear })
      .whereIn('status', ['pending', 'overdue'])
      .sum<{ sum: string | null }>('amount as sum')
      .first();

    const recentSellers = await db('sellers as s')
      .leftJoin('users as u', 's.user_id', 'u.id')
      .leftJoin('subscription_plans as sp', 's.subscription_plan_id', 'sp.id')
      .select(
        's.id',
        's.status',
        's.business_name',
        'u.name as user_name',
        'u.mobile',
        'sp.name as plan_name',
        's.created_at',
      )
      .orderBy('s.created_at', 'desc')
      .limit(6);

    return {
      userId,
      totalSellers: Number(totalSellerRow?.count ?? 0),
      activeSellers: Number(activeSellerRow?.count ?? 0),
      pendingSellers: Number(pendingSellerRow?.count ?? 0),
      sellersWithPlans: Number(sellersWithPlansRow?.count ?? 0),
      activePlans: Number(activePlansRow?.count ?? 0),
      monthlyRevenue: Number(paidThisMonthRow?.sum ?? 0),
      pendingCollections: Number(pendingAmountRow?.sum ?? 0),
      recentSellers: recentSellers.map((row) => {
        const status = row.status as SellerStatusDb | null;
        return {
          id: row.id,
          name: row.user_name,
          businessName: row.business_name,
          mobile: row.mobile,
          status: status ? sellerDisplayStatusMap[status] : 'Pending',
          subscriptionPlanName: row.plan_name,
        };
      }),
    };
  }

  async markBillPaid(billId: string, payload: unknown) {
    const data = paymentSchema.parse(payload);
    return { billId, ...data, status: 'pending_confirmation' };
  }

  async consumption(userId: string, filters: unknown) {
    z.object({ month: z.string().optional() }).parse(filters ?? {});
    return [];
  }
}

export const userService = new UserService();
