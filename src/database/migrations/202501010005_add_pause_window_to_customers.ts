import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('customers', (table) => {
    table.date('pause_from').nullable().after('start_date');
    table.date('pause_to').nullable().after('pause_from');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('customers', (table) => {
    table.dropColumn('pause_from');
    table.dropColumn('pause_to');
  });
}


