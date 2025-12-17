"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema.createTable('wallets', (table) => {
        table.uuid('id').primary();
        table
            .uuid('customer_id')
            .notNullable()
            .references('id')
            .inTable('customers')
            .onDelete('CASCADE');
        table.decimal('balance', 12, 2).notNullable().defaultTo(0);
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
        table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')).notNullable();
        table.unique(['customer_id']);
    });
    await knex.schema.createTable('wallet_transactions', (table) => {
        table.uuid('id').primary();
        table
            .uuid('wallet_id')
            .notNullable()
            .references('id')
            .inTable('wallets')
            .onDelete('CASCADE');
        table
            .enu('type', ['credit', 'debit'])
            .notNullable();
        table.decimal('amount', 12, 2).notNullable();
        table.string('reference');
        table.json('metadata');
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    });
}
async function down(knex) {
    await knex.schema.dropTableIfExists('wallet_transactions');
    await knex.schema.dropTableIfExists('wallets');
}
//# sourceMappingURL=202411200010_create_wallet_tables.js.map