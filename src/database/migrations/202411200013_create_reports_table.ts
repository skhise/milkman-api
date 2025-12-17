import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('report_snapshots', (table) => {
    table.uuid('id').primary();
    table
      .uuid('seller_id')
      .references('id')
      .inTable('sellers')
      .onDelete('CASCADE');
    table.enu('type', ['customer_consumption', 'product_sales', 'revenue']).notNullable();
    table.date('period_start');
    table.date('period_end');
    table.json('payload').notNullable();
    table.timestamp('generated_at').defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('report_snapshots');
}

