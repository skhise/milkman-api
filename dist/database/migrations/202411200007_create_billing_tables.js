"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema.createTable('bills', (table) => {
        table.uuid('id').primary();
        table
            .uuid('seller_id')
            .notNullable()
            .references('id')
            .inTable('sellers')
            .onDelete('CASCADE');
        table
            .uuid('customer_id')
            .notNullable()
            .references('id')
            .inTable('customers')
            .onDelete('CASCADE');
        table.string('month', 2).notNullable();
        table.string('year', 4).notNullable();
        table
            .enu('status', ['draft', 'issued', 'paid', 'overdue', 'cancelled'])
            .notNullable()
            .defaultTo('draft');
        table.decimal('total_amount', 12, 2).defaultTo(0);
        table.decimal('total_quantity', 12, 2).defaultTo(0);
        table.decimal('previous_dues', 12, 2).defaultTo(0);
        table.decimal('gst_amount', 12, 2).defaultTo(0);
        table.text('notes');
        table.timestamp('issued_at').nullable();
        table.timestamp('due_date').nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
        table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')).notNullable();
        table.unique(['seller_id', 'customer_id', 'month', 'year']);
    });
    await knex.schema.createTable('bill_items', (table) => {
        table.uuid('id').primary();
        table
            .uuid('bill_id')
            .notNullable()
            .references('id')
            .inTable('bills')
            .onDelete('CASCADE');
        table
            .uuid('product_id')
            .references('id')
            .inTable('products')
            .onDelete('SET NULL');
        table.date('service_date').notNullable();
        table.decimal('quantity', 10, 2).notNullable();
        table.decimal('unit_price', 10, 2).notNullable();
        table.decimal('total_price', 12, 2).notNullable();
        table.json('metadata');
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
        table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')).notNullable();
    });
}
async function down(knex) {
    await knex.schema.dropTableIfExists('bill_items');
    await knex.schema.dropTableIfExists('bills');
}
//# sourceMappingURL=202411200007_create_billing_tables.js.map