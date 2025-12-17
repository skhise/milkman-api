"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema.createTable('users', (table) => {
        table.uuid('id').primary();
        table.string('name').notNullable();
        table.string('email').notNullable().unique();
        table.string('mobile', 20).notNullable().unique();
        table.string('pin_hash', 255).notNullable();
        table.enu('role', ['admin', 'seller', 'user']).notNullable().defaultTo('user');
        table.enu('status', ['pending', 'active', 'inactive']).notNullable().defaultTo('pending');
        table.timestamp('last_login_at');
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
        table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')).notNullable();
    });
}
async function down(knex) {
    await knex.schema.dropTableIfExists('users');
}
//# sourceMappingURL=202411200001_create_users_table.js.map