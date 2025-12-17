import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('ads', (table) => {
    table.uuid('id').primary();
    table.string('title').notNullable();
    table.string('image_url').notNullable();
    table.string('url');
    table.timestamp('expires_at');
    table.enu('status', ['active', 'inactive']).defaultTo('active');
    table.json('targeting');
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('ads');
}

