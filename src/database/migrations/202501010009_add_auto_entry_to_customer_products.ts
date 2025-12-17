import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('customer_products', (table) => {
    table.boolean('auto_entry').defaultTo(true).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('customer_products', (table) => {
    table.dropColumn('auto_entry');
  });
}

