import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('ad_clicks', (table) => {
    table.uuid('id').primary();
    table
      .uuid('ad_id')
      .notNullable()
      .references('id')
      .inTable('ads')
      .onDelete('CASCADE');
    table
      .uuid('user_id')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table.string('user_role', 20); // Store role for analytics even if user is deleted
    table.integer('year').notNullable(); // e.g., 2025
    table.integer('month').notNullable(); // 1-12
    table.timestamp('clicked_at').defaultTo(knex.fn.now()).notNullable();

    // Indexes for efficient monthly queries
    table.index(['ad_id', 'year', 'month']);
    table.index(['year', 'month']);
    table.index(['clicked_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('ad_clicks');
}

