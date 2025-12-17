"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema.createTable('subscription_plans', (table) => {
        table.uuid('id').primary();
        table.string('name').notNullable();
        table.decimal('price', 10, 2).notNullable();
        table.enu('billing_cycle', ['monthly', 'yearly', 'custom']).notNullable();
        table.integer('customer_limit');
        table.integer('product_limit');
        table.text('description');
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
        table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')).notNullable();
    });
}
async function down(knex) {
    await knex.schema.dropTableIfExists('subscription_plans');
}
//# sourceMappingURL=202411200002_create_subscription_tables.js.map