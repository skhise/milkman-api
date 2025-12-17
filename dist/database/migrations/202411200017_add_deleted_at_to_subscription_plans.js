"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema.alterTable('subscription_plans', (table) => {
        table.timestamp('deleted_at').nullable();
    });
}
async function down(knex) {
    await knex.schema.alterTable('subscription_plans', (table) => {
        table.dropColumn('deleted_at');
    });
}
//# sourceMappingURL=202411200017_add_deleted_at_to_subscription_plans.js.map