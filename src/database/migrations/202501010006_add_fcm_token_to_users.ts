import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.string('fcm_token', 500).nullable().after('pin_hash');
    table.timestamp('fcm_token_updated_at').nullable().after('fcm_token');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('fcm_token_updated_at');
    table.dropColumn('fcm_token');
  });
}

