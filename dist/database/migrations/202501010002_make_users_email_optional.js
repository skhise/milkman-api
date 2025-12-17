"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    // Drop the unique constraint first (required before altering column in MySQL)
    try {
        await knex.schema.alterTable('users', (table) => {
            table.dropUnique(['email']);
        });
    }
    catch (error) {
        // Index might not exist or have a different name, try to drop by name
        try {
            await knex.raw('ALTER TABLE users DROP INDEX users_email_unique');
        }
        catch {
            // Ignore if index doesn't exist
        }
    }
    // Now alter the column to be nullable
    // For MySQL, we need to use raw SQL
    const client = knex.client.config.client || '';
    if (client.includes('mysql')) {
        await knex.raw('ALTER TABLE users MODIFY COLUMN email VARCHAR(255) NULL');
    }
    else {
        // For PostgreSQL and others
        await knex.schema.alterTable('users', (table) => {
            table.string('email').nullable().alter();
        });
    }
}
async function down(knex) {
    // Restore email as not nullable and unique
    const client = knex.client.config.client || '';
    if (client.includes('mysql')) {
        // First make it not nullable
        await knex.raw('ALTER TABLE users MODIFY COLUMN email VARCHAR(255) NOT NULL');
        // Then add unique constraint
        await knex.raw('ALTER TABLE users ADD UNIQUE KEY users_email_unique (email)');
    }
    else {
        await knex.schema.alterTable('users', (table) => {
            table.string('email').notNullable().unique().alter();
        });
    }
}
//# sourceMappingURL=202501010002_make_users_email_optional.js.map