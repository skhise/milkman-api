"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema.alterTable('daily_entries', (table) => {
        table.decimal('extra_quantity', 10, 2).defaultTo(0).after('quantity');
    });
}
async function down(knex) {
    await knex.schema.alterTable('daily_entries', (table) => {
        table.dropColumn('extra_quantity');
    });
}
//# sourceMappingURL=202501010005_add_extra_quantity_to_daily_entries.js.map