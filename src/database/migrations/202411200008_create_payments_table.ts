import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('payments', (table) => {
    table.uuid('id').primary();
    table
      .uuid('bill_id')
      .notNullable()
      .references('id')
      .inTable('bills')
      .onDelete('CASCADE');
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
      .enu('mode', ['cash', 'online', 'bank', 'upi'])
      .notNullable();
    table.decimal('amount', 12, 2).notNullable();
    table
      .enu('status', ['pending_confirmation', 'approved', 'rejected'])
      .defaultTo('pending_confirmation');
    table.string('reference');
    table.string('attachment_url');
    table.text('note');
    table.timestamp('confirmed_at');
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('payments');
}

