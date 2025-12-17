"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.raw("ALTER TABLE `users` MODIFY COLUMN `role` ENUM('admin','seller','user','customer') NOT NULL DEFAULT 'user'");
    await knex.schema.alterTable('customers', (table) => {
        table
            .uuid('user_id')
            .nullable()
            .references('id')
            .inTable('users')
            .onDelete('SET NULL');
        table.timestamp('exited_at').nullable();
        table.index(['seller_id', 'active']);
    });
}
async function down(knex) {
    await knex.schema.alterTable('customers', (table) => {
        table.dropIndex(['seller_id', 'active']);
        table.dropColumn('exited_at');
        table.dropColumn('user_id');
    });
    await knex.raw("ALTER TABLE `users` MODIFY COLUMN `role` ENUM('admin','seller','user') NOT NULL DEFAULT 'user'");
}
//# sourceMappingURL=202411200018_add_customer_user_link.js.map