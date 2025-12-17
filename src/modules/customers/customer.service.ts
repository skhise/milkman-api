import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { ApiError } from '../../utils/errorHandler';
import { getDb } from '../../database/connection';

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

const productSelectionSchema = z.object({
  productId: z.string().uuid('Valid product ID required'),
  quantity: z.number().positive('Quantity must be positive'),
  autoEntry: z.boolean().default(true),
});

const customerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  mobile: z.string().regex(/^\d{10}$/, 'Mobile number must be 10 digits'),
  email: z.string().email().optional(),
  dailyQuantity: z.enum(['0.5', '1', '2']).optional().transform((val) => val ? parseFloat(val) : 0),
  address: z.string().optional(),
  startDate: z.string().optional(),
  notes: z.string().optional(),
  products: z.array(productSelectionSchema).optional(),
});

const listSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  includeExited: z.literal('true').optional(),
});

const toggleSchema = z.object({
  active: z.boolean(),
});

const pauseSchema = z.object({
  pauseFrom: dateSchema.nullable().optional(),
  pauseTo: dateSchema.nullable().optional(),
}).refine(
  (data) => {
    if ((data.pauseFrom && !data.pauseTo) || (!data.pauseFrom && data.pauseTo)) {
      return false;
    }
    if (data.pauseFrom && data.pauseTo) {
      return data.pauseFrom <= data.pauseTo;
    }
    return true;
  },
  {
    message: 'Provide both pauseFrom and pauseTo, and ensure pauseFrom <= pauseTo',
    path: ['pauseTo'],
  },
);

class CustomerService {
  private mapRow(row: any) {
    // Combine address fields for backward compatibility, prefer address_line1
    const address = row.address_line1 || 
                    (row.address_line2 ? `${row.address_line1 || ''} ${row.address_line2}`.trim() : null) ||
                    (row.city || row.state || row.postal_code 
                      ? [row.address_line1, row.city, row.state, row.postal_code].filter(Boolean).join(', ')
                      : null);
    
    return {
      id: row.id,
      sellerId: row.seller_id,
      name: row.name,
      mobile: row.mobile,
      email: row.email,
      address: address,
      addressLine1: row.address_line1,
      addressLine2: row.address_line2,
      city: row.city,
      state: row.state,
      postalCode: row.postal_code,
      dailyQuantity: row.daily_quantity ? Number(row.daily_quantity) : 0,
      startDate: row.start_date,
      active: row.active === 1 || row.active === true,
      freezeUntil: row.freeze_until,
      pauseFrom: row.pause_from,
      pauseTo: row.pause_to,
      notes: row.notes,
      exitedAt: row.exited_at,
      userId: row.user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async create(sellerId: string, payload: unknown) {
    const data = customerSchema.parse(payload);
    if (!sellerId) {
      throw new ApiError('Seller id required', 400);
    }

    const db = getDb();
    const seller = await db('sellers').where({ id: sellerId }).first();
    if (!seller) {
      throw new ApiError('Seller not found', 404);
    }

    const existingCustomer = await db('customers')
      .where({ seller_id: sellerId, mobile: data.mobile })
      .whereNull('exited_at')
      .first();
    if (existingCustomer) {
      throw new ApiError('Customer already exists for this seller', 409);
    }

    const existingUser = await db('users').where({ mobile: data.mobile }).first();
    if (existingUser && existingUser.role !== 'customer') {
      throw new ApiError('Mobile already used by another account', 400);
    }

    const userId = existingUser ? existingUser.id : randomUUID();
    let temporaryPin: string | null = null;

    if (!existingUser) {
      temporaryPin = '123456';
      const pinHash = await bcrypt.hash(temporaryPin, 10);
      await db('users').insert({
        id: userId,
        name: data.name,
        email: data.email ?? null,
        mobile: data.mobile,
        pin_hash: pinHash,
        role: 'customer',
        status: 'active',
      });
    }

    const customerId = randomUUID();
    // Store address in address_line1 if provided (for backward compatibility with DB schema)
    await db('customers').insert({
      id: customerId,
      seller_id: sellerId,
      user_id: userId,
      name: data.name,
      mobile: data.mobile,
      email: data.email ?? null,
      address_line1: data.address ?? null,
      address_line2: null,
      city: null,
      state: null,
      postal_code: null,
      daily_quantity: data.dailyQuantity ?? 0,
      start_date: data.startDate ?? null,
      notes: data.notes ?? null,
      active: true,
    });

    // Handle product selections if provided
    if (data.products && data.products.length > 0) {
      for (const productSelection of data.products) {
        // Verify product belongs to seller
        const product = await db('products')
          .where({ id: productSelection.productId, seller_id: sellerId })
          .first();
        
        if (!product) {
          throw new ApiError(`Product ${productSelection.productId} not found for this seller`, 404);
        }

        // Insert or update customer_product
        const existing = await db('customer_products')
          .where({ customer_id: customerId, product_id: productSelection.productId })
          .first();

        if (existing) {
          await db('customer_products')
            .where({ id: existing.id })
            .update({
              quantity: productSelection.quantity,
              auto_entry: productSelection.autoEntry,
              active: true,
              updated_at: db.fn.now(),
            });
        } else {
          await db('customer_products').insert({
            id: randomUUID(),
            customer_id: customerId,
            product_id: productSelection.productId,
            quantity: productSelection.quantity,
            auto_entry: productSelection.autoEntry,
            active: true,
          });
        }
      }
    }

    const customer = await db('customers').where({ id: customerId }).first();

    return {
      customer: this.mapRow(customer),
      temporaryPin,
    };
  }

  async update(customerId: string, payload: unknown) {
    const data = customerSchema.partial().parse(payload);
    const db = getDb();

    const existing = await db('customers').where({ id: customerId }).first();
    if (!existing) {
      throw new ApiError('Customer not found', 404);
    }

    await db('customers')
      .where({ id: customerId })
      .update({
        name: typeof data.name !== 'undefined' ? data.name : existing.name,
        mobile: typeof data.mobile !== 'undefined' ? data.mobile : existing.mobile,
        email: typeof data.email !== 'undefined' ? data.email : existing.email,
        address_line1: typeof data.address !== 'undefined' ? data.address : existing.address_line1,
        daily_quantity:
          typeof data.dailyQuantity !== 'undefined' ? data.dailyQuantity : existing.daily_quantity,
        start_date: typeof data.startDate !== 'undefined' ? data.startDate : existing.start_date,
        notes: typeof data.notes !== 'undefined' ? data.notes : existing.notes,
        updated_at: db.fn.now(),
      });

    // Handle products if provided
    if (data.products && Array.isArray(data.products)) {
      // Get seller_id from existing customer
      const sellerId = existing.seller_id;

      // Validate all products belong to the seller
      if (data.products.length > 0) {
        const productIds = data.products.map((p) => p.productId);
        const validProducts = await db('products')
          .where({ seller_id: sellerId })
          .whereIn('id', productIds);
        if (validProducts.length !== productIds.length) {
          throw new ApiError('One or more products do not belong to this seller', 400);
        }
      }

      // Get existing customer products
      const existingProducts = await db('customer_products')
        .where({ customer_id: customerId })
        .select('product_id');

      const existingProductIds = existingProducts.map((p) => p.product_id);

      // Determine products to add, update, and remove
      const incomingProductIds = data.products.map((p) => p.productId);
      const toRemove = existingProductIds.filter((id) => !incomingProductIds.includes(id));
      const toAdd = data.products.filter((p) => !existingProductIds.includes(p.productId));
      const toUpdate = data.products.filter((p) => existingProductIds.includes(p.productId));

      // Remove products
      if (toRemove.length > 0) {
        await db('customer_products')
          .where({ customer_id: customerId })
          .whereIn('product_id', toRemove)
          .delete();
      }

      // Add new products
      for (const productSelection of toAdd) {
        await db('customer_products').insert({
          id: randomUUID(),
          customer_id: customerId,
          product_id: productSelection.productId,
          quantity: productSelection.quantity,
          auto_entry: productSelection.autoEntry,
          active: true,
        });
      }

      // Update existing products
      for (const productSelection of toUpdate) {
        await db('customer_products')
          .where({ customer_id: customerId, product_id: productSelection.productId })
          .update({
            quantity: productSelection.quantity,
            auto_entry: productSelection.autoEntry,
            active: true,
            updated_at: db.fn.now(),
          });
      }
    }

    const updated = await db('customers').where({ id: customerId }).first();
    return this.mapRow(updated);
  }

  async getByUserId(userId: string) {
    const db = getDb();
    const customer = await db('customers')
      .where({ user_id: userId })
      .whereNull('exited_at')
      .first();
    
    if (!customer) {
      throw new ApiError('Customer not found', 404);
    }
    
    return { customer: this.mapRow(customer) };
  }

  async setPauseWindow(customerId: string, payload: unknown) {
    const data = pauseSchema.parse(payload);
    const db = getDb();
    const existing = await db('customers').where({ id: customerId }).first();
    if (!existing) {
      throw new ApiError('Customer not found', 404);
    }

    // If there was a previous pause, update its status to completed if it's past
    if (existing.pause_from && existing.pause_to) {
      const today = new Date().toISOString().split('T')[0]!;
      const previousStatus = existing.pause_to < today ? 'completed' : 'scheduled';
      
      // Find and update existing pause entry in history
      const existingHistory = await db('pause_history')
        .where({
          customer_id: customerId,
          pause_from: existing.pause_from,
          pause_to: existing.pause_to,
        })
        .whereNot('status', 'canceled') // Don't update canceled entries
        .first();
      
      if (existingHistory) {
        // Update status if needed
        await db('pause_history')
          .where({ id: existingHistory.id })
          .update({
            status: previousStatus,
            updated_at: db.fn.now(),
          });
      } else {
        // Create history entry for previous pause if it doesn't exist
        await db('pause_history').insert({
          id: randomUUID(),
          customer_id: customerId,
          pause_from: existing.pause_from,
          pause_to: existing.pause_to,
          status: previousStatus,
        });
      }
    }

    // Update current pause window in customers table
    await db('customers')
      .where({ id: customerId })
      .update({
        pause_from: data.pauseFrom ?? null,
        pause_to: data.pauseTo ?? null,
        updated_at: db.fn.now(),
      });

    // If new pause is set, create or update history entry
    if (data.pauseFrom && data.pauseTo) {
      const today = new Date().toISOString().split('T')[0]!;
      const status = data.pauseFrom > today ? 'scheduled' : 'active';
      
      // Check if this pause entry already exists
      const existingHistory = await db('pause_history')
        .where({
          customer_id: customerId,
          pause_from: data.pauseFrom,
          pause_to: data.pauseTo,
        })
        .first();
      
      if (existingHistory) {
        // Update existing entry (in case it was canceled before)
        await db('pause_history')
          .where({ id: existingHistory.id })
          .update({
            status: status,
            updated_at: db.fn.now(),
          });
      } else {
        // Create new entry
        await db('pause_history').insert({
          customer_id: customerId,
          pause_from: data.pauseFrom,
          pause_to: data.pauseTo,
          status: status,
        });
      }
    }

    const updated = await db('customers').where({ id: customerId }).first();
    return this.mapRow(updated);
  }

  async getPauseHistory(customerId: string) {
    const db = getDb();
    const customer = await db('customers').where({ id: customerId }).first();
    if (!customer) {
      throw new ApiError('Customer not found', 404);
    }

    // Get all pause entries from history table (including canceled ones)
    const history = await db('pause_history')
      .where({ customer_id: customerId })
      .orderBy('pause_from', 'desc')
      .select('id', 'customer_id as customerId', 'pause_from as pauseFrom', 'pause_to as pauseTo', 'status', 'created_at as createdAt', 'updated_at as updatedAt');

    // Also include current pause if it exists and is not in history
    if (customer.pause_from && customer.pause_to) {
      const currentInHistory = history.some(
        (h) => h.pauseFrom === customer.pause_from && h.pauseTo === customer.pause_to
      );
      
      if (!currentInHistory) {
        const today = new Date().toISOString().split('T')[0]!;
        const status = customer.pause_from > today ? 'scheduled' : 
                      customer.pause_to < today ? 'completed' : 'active';
        
        history.unshift({
          id: 'current',
          customerId: customerId,
          pauseFrom: customer.pause_from,
          pauseTo: customer.pause_to,
          status: status,
          createdAt: customer.created_at,
          updatedAt: customer.updated_at,
        });
      }
    }

    return history;
  }

  async cancelPause(customerId: string, pauseId: string) {
    const db = getDb();
    const customer = await db('customers').where({ id: customerId }).first();
    if (!customer) {
      throw new ApiError('Customer not found', 404);
    }

    let historyEntry = null;

    // Find the pause entry in history
    if (pauseId === 'current') {
      // If canceling current pause, find it by dates
      if (customer.pause_from && customer.pause_to) {
        historyEntry = await db('pause_history')
          .where({
            customer_id: customerId,
            pause_from: customer.pause_from,
            pause_to: customer.pause_to,
          })
          .first();
        
        // If not found, create it
        if (!historyEntry) {
          // MySQL doesn't support .returning(), so insert and fetch
          await db('pause_history').insert({
            id: randomUUID(),
            customer_id: customerId,
            pause_from: customer.pause_from,
            pause_to: customer.pause_to,
            status: 'canceled',
          });
          // Fetch the created entry
          historyEntry = await db('pause_history')
            .where({
              customer_id: customerId,
              pause_from: customer.pause_from,
              pause_to: customer.pause_to,
            })
            .first();
        }
      }
    } else {
      // Find by ID
      historyEntry = await db('pause_history')
        .where({ id: pauseId, customer_id: customerId })
        .first();
    }

    if (!historyEntry) {
      throw new ApiError('Pause entry not found', 404);
    }

    // Update status to canceled in history table
    await db('pause_history')
      .where({ id: historyEntry.id })
      .update({
        status: 'canceled',
        updated_at: db.fn.now(),
      });

    // If canceling current pause, also clear it from customers table
    if (pauseId === 'current' && customer.pause_from && customer.pause_to) {
      await db('customers')
        .where({ id: customerId })
        .update({
          pause_from: null,
          pause_to: null,
          updated_at: db.fn.now(),
        });
    }

    return { success: true };
  }

  async toggleStatus(customerId: string, payload: unknown) {
    const data = toggleSchema.parse(payload);
    const db = getDb();

    const existing = await db('customers').where({ id: customerId }).first();
    if (!existing) {
      throw new ApiError('Customer not found', 404);
    }

    await db('customers')
      .where({ id: customerId })
      .update({
        active: data.active,
        updated_at: db.fn.now(),
      });

    const updated = await db('customers').where({ id: customerId }).first();
    return this.mapRow(updated);
  }

  async resetPin(customerId: string) {
    const db = getDb();
    const customer = await db('customers').where({ id: customerId }).first();
    if (!customer) {
      throw new ApiError('Customer not found', 404);
    }
    if (!customer.user_id) {
      throw new ApiError('Customer login not configured', 400);
    }

    const fixedPin = '123456';
    const pinHash = await bcrypt.hash(fixedPin, 10);

    await db('users')
      .where({ id: customer.user_id })
      .update({ pin_hash: pinHash, updated_at: db.fn.now() });

    return { temporaryPin: fixedPin };
  }

  async exit(customerId: string) {
    const db = getDb();
    const customer = await db('customers').where({ id: customerId }).first();
    if (!customer) {
      throw new ApiError('Customer not found', 404);
    }

    await db('customers')
      .where({ id: customerId })
      .update({
        active: false,
        exited_at: db.fn.now(),
        updated_at: db.fn.now(),
      });

    const updated = await db('customers').where({ id: customerId }).first();
    return this.mapRow(updated);
  }

  async list(sellerId: string, filters: unknown) {
    if (!sellerId) {
      throw new ApiError('Seller id required', 400);
    }

    const params = listSchema.parse(filters ?? {});
    const db = getDb();

    const query = db('customers').where({ seller_id: sellerId });

    if (!params.includeExited) {
      query.whereNull('exited_at');
    }

    if (params.status) {
      query.where('active', params.status === 'active');
    }

    if (params.search) {
      query.andWhere((builder) => {
        builder
          .whereILike('name', `%${params.search}%`)
          .orWhere('mobile', 'like', `%${params.search}%`)
          .orWhereILike('city', `%${params.search}%`);
      });
    }

    const rows = await query.orderBy('created_at', 'desc');
    const customers = await Promise.all(
      rows.map(async (row) => {
        const customer = this.mapRow(row);
        // Fetch products for this customer
        const customerProducts = await db('customer_products')
          .join('products', 'customer_products.product_id', 'products.id')
          .where({ 'customer_products.customer_id': customer.id, 'customer_products.active': true })
          .select(
            'customer_products.product_id as productId',
            'customer_products.quantity',
            'customer_products.auto_entry as autoEntry',
            'products.name as productName',
            'products.unit'
          );
        
        return {
          ...customer,
          products: customerProducts.map((cp) => ({
            productId: cp.productId,
            quantity: Number(cp.quantity),
            autoEntry: cp.autoEntry === 1 || cp.autoEntry === true,
            productName: cp.productName,
            unit: cp.unit,
          })),
        };
      })
    );
    
    return {
      customers,
    };
  }

  /**
   * Clear expired pause windows for all customers
   * This is called by a cron job to automatically clear pauses that have passed their end date
   */
  async clearExpiredPauses() {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0]!; // YYYY-MM-DD format

    try {
      const result = await db('customers')
        .whereNotNull('pause_to')
        .where('pause_to', '<', today)
        .update({
          pause_from: null,
          pause_to: null,
          updated_at: db.fn.now(),
        });

      console.log(`[Cron] Cleared ${result} expired pause windows`);
      return { cleared: result };
    } catch (error) {
      console.error('[Cron] Error clearing expired pauses:', error);
      throw error;
    }
  }
}

export const customerService = new CustomerService();
