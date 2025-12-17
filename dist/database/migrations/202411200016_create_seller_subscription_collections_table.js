"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema.createTable('seller_subscription_collections', (table) => {
        table.uuid('id').primary();
        table
            .uuid('seller_id')
            .notNullable()
            .references('id')
            .inTable('sellers')
            .onDelete('CASCADE');
        table
            .uuid('subscription_plan_id')
            .references('id')
            .inTable('subscription_plans')
            .onDelete('SET NULL');
        table.string('month', 2).notNullable();
        table.string('year', 4).notNullable();
        table.decimal('amount', 12, 2).notNullable();
        table
            .enu('status', ['pending', 'overdue', 'paid'])
            .notNullable()
            .defaultTo('pending');
        table.date('due_date').notNullable();
        table
            .enu('payment_mode', ['cash', 'online', 'bank', 'upi'])
            .nullable();
        table.string('reference').nullable();
        table.timestamp('paid_at').nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
        table
            .timestamp('updated_at')
            .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))
            .notNullable();
        table.unique(['seller_id', 'month', 'year']);
        table.index(['seller_id', 'status']);
    });
}
async function down(knex) {
    await knex.schema.dropTableIfExists('seller_subscription_collections');
}
//# sourceMappingURL=202411200016_create_seller_subscription_collections_table.js.map