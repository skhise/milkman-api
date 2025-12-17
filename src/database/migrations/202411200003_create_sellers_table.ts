import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('sellers', (table) => {
    table.uuid('id').primary();
    table
      .uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.string('business_name').notNullable();
    table.string('contact_email').notNullable();
    table.string('contact_phone', 20).notNullable();
    table.enu('status', ['pending', 'active', 'suspended']).notNullable().defaultTo('pending');
    table.date('billing_cycle_anchor');
    table
      .uuid('subscription_plan_id')
      .references('id')
      .inTable('subscription_plans')
      .onDelete('SET NULL');
    table.enu('subscription_status', ['trial', 'active', 'expired']).defaultTo('trial');
    table.json('metadata');
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')).notNullable();

    table.unique(['user_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('sellers');
}

