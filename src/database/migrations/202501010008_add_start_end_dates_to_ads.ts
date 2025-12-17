import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('ads', (table) => {
    table.timestamp('start_date').nullable().after('expires_at');
    table.timestamp('end_date').nullable().after('start_date');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('ads', (table) => {
    table.dropColumn('start_date');
    table.dropColumn('end_date');
  });
}

