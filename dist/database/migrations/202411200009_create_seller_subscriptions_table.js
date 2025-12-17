"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema.createTable('seller_subscriptions', (table) => {
        table.uuid('id').primary();
        table
            .uuid('seller_id')
            .notNullable()
            .references('id')
            .inTable('sellers')
            .onDelete('CASCADE');
        table
            .uuid('plan_id')
            .notNullable()
            .references('id')
            .inTable('subscription_plans')
            .onDelete('CASCADE');
        table.timestamp('starts_at').notNullable().defaultTo(knex.fn.now());
        table.timestamp('ends_at').notNullable().defaultTo(knex.fn.now());
        table.enu('status', ['pending', 'active', 'expired', 'cancelled']).defaultTo('pending');
        table.string('payment_reference');
        table.json('metadata');
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
        table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')).notNullable();
        table.index(['seller_id', 'status']);
    });
}
async function down(knex) {
    await knex.schema.dropTableIfExists('seller_subscriptions');
}
//# sourceMappingURL=202411200009_create_seller_subscriptions_table.js.map