"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema.alterTable('ads', (table) => {
        table.timestamp('start_date').nullable().after('expires_at');
        table.timestamp('end_date').nullable().after('start_date');
    });
}
async function down(knex) {
    await knex.schema.alterTable('ads', (table) => {
        table.dropColumn('start_date');
        table.dropColumn('end_date');
    });
}
//# sourceMappingURL=202501010008_add_start_end_dates_to_ads.js.map