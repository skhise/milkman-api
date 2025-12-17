import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('customer_extra_products', (table) => {
    table.uuid('id').primary();
    table
      .uuid('seller_id')
      .notNullable()
      .references('id')
      .inTable('sellers')
      .onDelete('CASCADE');
    table
      .uuid('customer_id')
      .notNullable()
      .references('id')
      .inTable('customers')
      .onDelete('CASCADE');
    table.string('product_name').notNullable(); // e.g., 'curd', 'paneer', 'ghee'
    table.decimal('price', 10, 2).notNullable();
    table.decimal('quantity', 10, 2).defaultTo(1);
    table.string('unit', 20).defaultTo('unit'); // 'unit', 'kg', 'litre'
    table.date('sale_date').notNullable();
    table.text('notes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')).notNullable();

    table.index(['seller_id', 'customer_id', 'sale_date']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('customer_extra_products');
}

