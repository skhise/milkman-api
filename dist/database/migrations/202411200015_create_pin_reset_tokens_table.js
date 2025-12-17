"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema.createTable('pin_reset_tokens', (table) => {
        table.uuid('id').primary();
        table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.string('otp', 6).notNullable();
        table.string('reference', 255).notNullable().unique();
        table.enu('status', ['pending', 'verified', 'expired', 'used']).notNullable().defaultTo('pending');
        table.timestamp('expires_at').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
        table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')).notNullable();
        table.index(['reference', 'status']);
        table.index(['user_id', 'status']);
    });
}
async function down(knex) {
    await knex.schema.dropTableIfExists('pin_reset_tokens');
}
//# sourceMappingURL=202411200015_create_pin_reset_tokens_table.js.map