"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema.createTable('pause_history', (table) => {
        table.uuid('id').primary();
        table.uuid('customer_id').notNullable().references('id').inTable('customers').onDelete('CASCADE');
        table.date('pause_from').notNullable();
        table.date('pause_to').notNullable();
        table.enum('status', ['active', 'scheduled', 'completed', 'canceled']).defaultTo('scheduled');
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
        table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')).notNullable();
        table.index(['customer_id']);
        table.index(['status']);
        table.index(['pause_from']);
    });
}
async function down(knex) {
    await knex.schema.dropTableIfExists('pause_history');
}
//# sourceMappingURL=202501010010_create_pause_history_table.js.map