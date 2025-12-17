"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema.createTable('customers', (table) => {
        table.uuid('id').primary();
        table
            .uuid('seller_id')
            .notNullable()
            .references('id')
            .inTable('sellers')
            .onDelete('CASCADE');
        table.string('name').notNullable();
        table.string('mobile', 20).notNullable();
        table.string('email');
        table.string('address_line1');
        table.string('address_line2');
        table.string('city');
        table.string('state');
        table.string('postal_code', 10);
        table.decimal('daily_quantity', 10, 2).defaultTo(0);
        table.date('start_date');
        table.boolean('active').defaultTo(true);
        table.date('freeze_until');
        table.text('notes');
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
        table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')).notNullable();
        table.index(['seller_id', 'mobile']);
    });
}
async function down(knex) {
    await knex.schema.dropTableIfExists('customers');
}
//# sourceMappingURL=202411200004_create_customers_table.js.map