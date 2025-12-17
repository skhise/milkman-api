import { z } from 'zod';
import { randomUUID } from 'crypto';
import { getDb } from '../../database/connection';

const targetingSchema = z
  .object({
    role: z.enum(['seller', 'admin', 'customer']).optional(),
  })
  .passthrough()
  .optional();

const adSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  imageUrl: z.string().url('Image URL must be valid'),
  url: z.string().url('Landing URL must be valid').optional(),
  expiresAt: z.string().datetime().optional(), // Keep for backward compatibility
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  targeting: targetingSchema,
});

type AdRow = {
  id: string;
  title: string;
  image_url: string;
  url: string | null;
  expires_at: string | null;
  start_date: string | null;
  end_date: string | null;
  status: 'active' | 'inactive';
  targeting: any;
  created_at: string;
  updated_at: string;
};

export type AdResponse = {
  id: string;
  title: string;
  imageUrl: string;
  url?: string | null;
  expiresAt?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status: 'active' | 'inactive';
  targeting?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

class AdsService {
  private parseTargeting(value: any) {
    if (!value) return null;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (_error) {
        return null;
      }
    }
    return value;
  }

  private mapRow(row: AdRow): AdResponse {
    return {
      id: row.id,
      title: row.title,
      imageUrl: row.image_url,
      url: row.url,
      expiresAt: row.expires_at,
      startDate: row.start_date,
      endDate: row.end_date,
      status: row.status,
      targeting: this.parseTargeting(row.targeting),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async listActive() {
    const db = getDb();
    
    // First, let's check all ads to debug
    const allAds = await db<AdRow>('ads').select('*');
    console.log('[AdsService] Total ads in database:', allAds.length);
    console.log('[AdsService] All ads:', allAds.map(a => ({
      id: a.id,
      title: a.title,
      status: a.status,
      expires_at: a.expires_at,
      targeting: a.targeting,
    })));
    
    // Get current date/time for comparison
    const now = new Date();
    
    const rows = await db<AdRow>('ads')
      .where({ status: 'active' })
      .where((qb) => {
        // Filter by start_date and end_date if they exist
        // Priority: start_date/end_date > expires_at (legacy)
        qb.where((subQb) => {
          // New date range logic (if start_date or end_date exist)
          subQb
            .where((dateRangeQb) => {
              dateRangeQb
                .whereNotNull('start_date')
                .orWhereNotNull('end_date');
            })
            .where((startQb) => {
              startQb
                .whereNull('start_date')
                .orWhereRaw('start_date <= NOW()');
            })
            .where((endQb) => {
              endQb
                .whereNull('end_date')
                .orWhereRaw('DATE(end_date) >= CURDATE()');
            });
        })
        .orWhere((legacyQb) => {
          // Legacy expires_at support (if both start_date and end_date are null)
          legacyQb
            .whereNull('start_date')
            .whereNull('end_date')
            .where((expQb) => {
              expQb
                .whereNull('expires_at')
                .orWhere('expires_at', '')
                .orWhereRaw('DATE(expires_at) >= CURDATE()');
            });
        });
      })
      .orderBy('updated_at', 'desc');

    console.log('[AdsService] Current date/time:', now.toISOString());
    console.log('[AdsService] Active ads after filtering:', rows.length);
    console.log('[AdsService] Filtered ads:', rows.map(r => ({
      id: r.id,
      title: r.title,
      status: r.status,
      expires_at: r.expires_at,
      expires_at_type: typeof r.expires_at,
    })));
    
    // Debug: Check why ads are being filtered out
    if (rows.length === 0 && allAds.length > 0) {
      console.log('[AdsService] DEBUG: Checking why ads were filtered out...');
      allAds.forEach(ad => {
        if (ad.status === 'active') {
          const expiresAt = ad.expires_at ? new Date(ad.expires_at) : null;
          const isExpired = expiresAt ? expiresAt <= now : false;
          console.log(`[AdsService] Ad "${ad.title}": expires_at=${ad.expires_at}, parsed=${expiresAt?.toISOString()}, isExpired=${isExpired}, shouldShow=${!isExpired || !expiresAt}`);
        }
      });
    }

    return rows.map((row) => this.mapRow(row));
  }

  async listAll() {
    const db = getDb();
    const rows = await db<AdRow>('ads')
      .orderBy('created_at', 'desc')
      .select('*');
    return rows.map((row) => this.mapRow(row));
  }

  async create(payload: unknown) {
    const data = adSchema.parse(payload);
    const db = getDb();
    const id = randomUUID();

    await db('ads').insert({
      id,
      title: data.title,
      image_url: data.imageUrl,
      url: data.url ?? null,
      expires_at: data.expiresAt ?? null,
      start_date: data.startDate ?? null,
      end_date: data.endDate ?? null,
      status: data.status ?? 'active',
      targeting: data.targeting ? JSON.stringify(data.targeting) : null,
    });

    const row = await db<AdRow>('ads').where({ id }).first();
    return this.mapRow(row!);
  }

  async update(adId: string, payload: unknown) {
    const data = adSchema.partial().parse(payload);
    const db = getDb();

    const existing = await db<AdRow>('ads').where({ id: adId }).first();
    if (!existing) {
      throw new Error('Ad not found');
    }

    await db('ads')
      .where({ id: adId })
      .update({
        title: typeof data.title !== 'undefined' ? data.title : existing.title,
        image_url: typeof data.imageUrl !== 'undefined' ? data.imageUrl : existing.image_url,
        url: typeof data.url !== 'undefined' ? data.url : existing.url,
        expires_at: typeof data.expiresAt !== 'undefined' ? data.expiresAt : existing.expires_at,
        start_date: typeof data.startDate !== 'undefined' ? data.startDate : existing.start_date,
        end_date: typeof data.endDate !== 'undefined' ? data.endDate : existing.end_date,
        status: typeof data.status !== 'undefined' ? data.status : existing.status,
        targeting:
          typeof data.targeting !== 'undefined'
            ? data.targeting
              ? JSON.stringify(data.targeting)
              : null
            : existing.targeting,
        updated_at: db.fn.now(),
      });

    const row = await db<AdRow>('ads').where({ id: adId }).first();
    return this.mapRow(row!);
  }

  async delete(adId: string) {
    const db = getDb();
    const existing = await db<AdRow>('ads').where({ id: adId }).first();
    if (!existing) {
      throw new Error('Ad not found');
    }
    await db('ads').where({ id: adId }).delete();
    return { success: true };
  }

  async recordClick(adId: string, userId?: string, userRole?: string) {
    const db = getDb();
    const id = randomUUID();
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-12

    console.log('[AdsService] Recording click:', { id, adId, userId, userRole, year, month });

    try {
      await db('ad_clicks').insert({
        id,
        ad_id: adId,
        user_id: userId || null,
        user_role: userRole || null,
        year,
        month,
        clicked_at: db.fn.now(),
      });

      console.log('[AdsService] Click inserted successfully');
      return { id, adId, year, month };
    } catch (error: any) {
      console.error('[AdsService] Error inserting click:', error);
      // Check if table exists
      const tableExists = await db.schema.hasTable('ad_clicks');
      console.log('[AdsService] ad_clicks table exists:', tableExists);
      throw error;
    }
  }

  async getMonthlyStats(adId: string, year?: number, month?: number) {
    const db = getDb();
    const query = db('ad_clicks').where({ ad_id: adId });

    if (year) {
      query.where({ year });
      if (month) {
        query.where({ month });
      }
    }

    const stats = await query
      .select(
        db.raw('year, month, COUNT(*) as click_count'),
        db.raw('COUNT(DISTINCT user_id) as unique_users')
      )
      .groupBy('year', 'month')
      .orderBy('year', 'desc')
      .orderBy('month', 'desc');

    return stats.map((stat) => ({
      year: stat.year,
      month: stat.month,
      clickCount: parseInt(stat.click_count as string, 10),
      uniqueUsers: parseInt(stat.unique_users as string, 10),
    }));
  }

  async getAdStats(adId: string) {
    const db = getDb();
    
    // Total clicks
    const totalClicks = await db('ad_clicks')
      .where({ ad_id: adId })
      .count('* as count')
      .first();

    // Unique users
    const uniqueUsers = await db('ad_clicks')
      .where({ ad_id: adId })
      .whereNotNull('user_id')
      .countDistinct('user_id as count')
      .first();

    // Monthly breakdown
    const monthlyStats = await this.getMonthlyStats(adId);

    return {
      totalClicks: parseInt((totalClicks?.count as string) || '0', 10),
      uniqueUsers: parseInt((uniqueUsers?.count as string) || '0', 10),
      monthlyStats,
    };
  }
}

export const adsService = new AdsService();
