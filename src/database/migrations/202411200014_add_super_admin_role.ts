import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // MySQL doesn't support ALTER ENUM directly, so we need to alter the column
  // First, modify the column to allow the new value
  await knex.raw(`
    ALTER TABLE users 
    MODIFY COLUMN role ENUM('admin', 'seller', 'user', 'super_admin') 
    NOT NULL DEFAULT 'user'
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Revert to original enum values
  await knex.raw(`
    ALTER TABLE users 
    MODIFY COLUMN role ENUM('admin', 'seller', 'user') 
    NOT NULL DEFAULT 'user'
  `);
}

