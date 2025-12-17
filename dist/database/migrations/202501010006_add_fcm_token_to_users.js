"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema.alterTable('users', (table) => {
        table.string('fcm_token', 500).nullable().after('pin_hash');
        table.timestamp('fcm_token_updated_at').nullable().after('fcm_token');
    });
}
async function down(knex) {
    await knex.schema.alterTable('users', (table) => {
        table.dropColumn('fcm_token_updated_at');
        table.dropColumn('fcm_token');
    });
}
//# sourceMappingURL=202501010006_add_fcm_token_to_users.js.map