import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('seller_subscriptions', (table) => {
    table.uuid('id').primary();
    table
      .uuid('seller_id')
      .notNullable()
      .references('id')
      .inTable('sellers')
      .onDelete('CASCADE');
    table
      .uuid('plan_id')
      .notNullable()
      .references('id')
      .inTable('subscription_plans')
      .onDelete('CASCADE');
    table.timestamp('starts_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('ends_at').notNullable().defaultTo(knex.fn.now());
    table.enu('status', ['pending', 'active', 'expired', 'cancelled']).defaultTo('pending');
    table.string('payment_reference');
    table.json('metadata');
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')).notNullable();

    table.index(['seller_id', 'status']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('seller_subscriptions');
}

