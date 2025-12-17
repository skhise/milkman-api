import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('pause_history', (table) => {
    table.uuid('id').primary();
    table.uuid('customer_id').notNullable().references('id').inTable('customers').onDelete('CASCADE');
    table.date('pause_from').notNullable();
    table.date('pause_to').notNullable();
    table.enum('status', ['active', 'scheduled', 'completed', 'canceled']).defaultTo('scheduled');
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')).notNullable();
    
    table.index(['customer_id']);
    table.index(['status']);
    table.index(['pause_from']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('pause_history');
}
