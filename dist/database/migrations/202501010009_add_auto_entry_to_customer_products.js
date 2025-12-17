"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema.alterTable('customer_products', (table) => {
        table.boolean('auto_entry').defaultTo(true).notNullable();
    });
}
async function down(knex) {
    await knex.schema.alterTable('customer_products', (table) => {
        table.dropColumn('auto_entry');
    });
}
//# sourceMappingURL=202501010009_add_auto_entry_to_customer_products.js.map