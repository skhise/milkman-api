import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('seller_subscription_history', (table) => {
    table.uuid('id').primary();
    table
      .uuid('seller_id')
      .notNullable()
      .references('id')
      .inTable('sellers')
      .onDelete('CASCADE');
    table.uuid('old_plan_id').nullable().references('id').inTable('subscription_plans').onDelete('SET NULL');
    table.uuid('new_plan_id').nullable().references('id').inTable('subscription_plans').onDelete('SET NULL');
    table.uuid('changed_by').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('seller_subscription_history');
}

