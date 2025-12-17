"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
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
async function down(knex) {
    await knex.schema.dropTableIfExists('report_snapshots');
}
//# sourceMappingURL=202411200013_create_reports_table.js.map