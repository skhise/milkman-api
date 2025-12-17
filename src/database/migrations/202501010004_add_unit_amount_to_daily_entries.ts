import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('daily_entries', (table) => {
    table.decimal('unit_amount', 10, 2).defaultTo(0).after('extra_amount');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('daily_entries', (table) => {
    table.dropColumn('unit_amount');
  });
}


