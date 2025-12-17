import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('subscription_plans', (table) => {
    table.uuid('id').primary();
    table.string('name').notNullable();
    table.decimal('price', 10, 2).notNullable();
    table.enu('billing_cycle', ['monthly', 'yearly', 'custom']).notNullable();
    table.integer('customer_limit');
    table.integer('product_limit');
    table.text('description');
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('subscription_plans');
}

