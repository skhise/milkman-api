"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema.createTable('products', (table) => {
        table.uuid('id').primary();
        table
            .uuid('seller_id')
            .notNullable()
            .references('id')
            .inTable('sellers')
            .onDelete('CASCADE');
        table.string('name').notNullable();
        table.decimal('price_per_unit', 10, 2).notNullable();
        table.enu('unit', ['litre', 'unit', 'kg']).notNullable();
        table.enu('status', ['active', 'inactive']).defaultTo('active');
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
        table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')).notNullable();
    });
    await knex.schema.createTable('customer_products', (table) => {
        table.uuid('id').primary();
        table
            .uuid('customer_id')
            .notNullable()
            .references('id')
            .inTable('customers')
            .onDelete('CASCADE');
        table
            .uuid('product_id')
            .notNullable()
            .references('id')
            .inTable('products')
            .onDelete('CASCADE');
        table.decimal('quantity', 10, 2).notNullable();
        table.boolean('active').defaultTo(true);
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
        table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')).notNullable();
        table.unique(['customer_id', 'product_id']);
    });
}
async function down(knex) {
    await knex.schema.dropTableIfExists('customer_products');
    await knex.schema.dropTableIfExists('products');
}
//# sourceMappingURL=202411200005_create_products_table.js.map