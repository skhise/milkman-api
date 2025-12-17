"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
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
async function down(knex) {
    await knex.schema.dropTableIfExists('ads');
}
//# sourceMappingURL=202411200011_create_ads_table.js.map