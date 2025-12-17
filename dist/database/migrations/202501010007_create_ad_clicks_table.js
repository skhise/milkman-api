"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
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
async function down(knex) {
    await knex.schema.dropTableIfExists('ad_clicks');
}
//# sourceMappingURL=202501010007_create_ad_clicks_table.js.map