"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema.alterTable('daily_entries', (table) => {
        table.decimal('unit_amount', 10, 2).defaultTo(0).after('extra_amount');
    });
}
async function down(knex) {
    await knex.schema.alterTable('daily_entries', (table) => {
        table.dropColumn('unit_amount');
    });
}
//# sourceMappingURL=202501010004_add_unit_amount_to_daily_entries.js.map