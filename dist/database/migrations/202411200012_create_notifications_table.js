"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema.createTable('notifications', (table) => {
        table.uuid('id').primary();
        table.string('title').notNullable();
        table.text('body').notNullable();
        table.json('channels').notNullable();
        table.json('data').nullable();
        table
            .uuid('user_id')
            .references('id')
            .inTable('users')
            .onDelete('CASCADE');
        table.timestamp('read_at').nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    });
}
async function down(knex) {
    await knex.schema.dropTableIfExists('notifications');
}
//# sourceMappingURL=202411200012_create_notifications_table.js.map