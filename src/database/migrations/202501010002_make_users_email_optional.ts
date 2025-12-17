import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Drop the unique constraint first (required before altering column in MySQL)
  try {
    await knex.schema.alterTable('users', (table) => {
      table.dropUnique(['email']);
    });
  } catch (error) {
    // Index might not exist or have a different name, try to drop by name
    try {
      await knex.raw('ALTER TABLE users DROP INDEX users_email_unique');
    } catch {
      // Ignore if index doesn't exist
    }
  }

  // Now alter the column to be nullable
  // For MySQL, we need to use raw SQL
  const client = (knex.client.config.client as string) || '';
  if (client.includes('mysql')) {
    await knex.raw('ALTER TABLE users MODIFY COLUMN email VARCHAR(255) NULL');
  } else {
    // For PostgreSQL and others
    await knex.schema.alterTable('users', (table) => {
      table.string('email').nullable().alter();
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  // Restore email as not nullable and unique
  const client = (knex.client.config.client as string) || '';
  
  if (client.includes('mysql')) {
    // First make it not nullable
    await knex.raw('ALTER TABLE users MODIFY COLUMN email VARCHAR(255) NOT NULL');
    // Then add unique constraint
    await knex.raw('ALTER TABLE users ADD UNIQUE KEY users_email_unique (email)');
  } else {
    await knex.schema.alterTable('users', (table) => {
      table.string('email').notNullable().unique().alter();
    });
  }
}

