"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema.alterTable('customers', (table) => {
        table.date('pause_from').nullable().after('start_date');
        table.date('pause_to').nullable().after('pause_from');
    });
}
async function down(knex) {
    await knex.schema.alterTable('customers', (table) => {
        table.dropColumn('pause_from');
        table.dropColumn('pause_to');
    });
}
//# sourceMappingURL=202501010005_add_pause_window_to_customers.js.map