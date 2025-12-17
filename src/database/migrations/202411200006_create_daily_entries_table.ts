import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('daily_entries', (table) => {
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
    table
      .uuid('product_id')
      .notNullable()
      .references('id')
      .inTable('products')
      .onDelete('CASCADE');
    table.date('entry_date').notNullable();
    table.decimal('quantity', 10, 2).notNullable();
    table.boolean('delivered').defaultTo(false);
    table.text('notes');
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')).notNullable();

    table.index(['seller_id', 'entry_date']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('daily_entries');
}

