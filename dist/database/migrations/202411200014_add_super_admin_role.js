"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    // MySQL doesn't support ALTER ENUM directly, so we need to alter the column
    // First, modify the column to allow the new value
    await knex.raw(`
    ALTER TABLE users 
    MODIFY COLUMN role ENUM('admin', 'seller', 'user', 'super_admin') 
    NOT NULL DEFAULT 'user'
  `);
}
async function down(knex) {
    // Revert to original enum values
    await knex.raw(`
    ALTER TABLE users 
    MODIFY COLUMN role ENUM('admin', 'seller', 'user') 
    NOT NULL DEFAULT 'user'
  `);
}
//# sourceMappingURL=202411200014_add_super_admin_role.js.map