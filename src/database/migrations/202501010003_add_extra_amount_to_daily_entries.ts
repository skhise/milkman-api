import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('daily_entries', (table) => {
    table.decimal('extra_amount', 10, 2).defaultTo(0).after('quantity');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('daily_entries', (table) => {
    table.dropColumn('extra_amount');
  });
}

