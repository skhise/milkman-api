import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    "ALTER TABLE `users` MODIFY COLUMN `role` ENUM('admin','seller','user','customer') NOT NULL DEFAULT 'user'",
  );

  await knex.schema.alterTable('customers', (table) => {
    table
      .uuid('user_id')
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table.timestamp('exited_at').nullable();
    table.index(['seller_id', 'active']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('customers', (table) => {
    table.dropIndex(['seller_id', 'active']);
    table.dropColumn('exited_at');
    table.dropColumn('user_id');
  });

  await knex.raw(
    "ALTER TABLE `users` MODIFY COLUMN `role` ENUM('admin','seller','user') NOT NULL DEFAULT 'user'",
  );
}

