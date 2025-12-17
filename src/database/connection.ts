import knex from 'knex';
import type { Knex } from 'knex';
import { Model } from 'objection';
import { getEnv } from '../utils/getEnv';

let db: Knex | null = null;

export const initDatabase = async () => {
  if (db) return db;

  db = knex({
    client: 'mysql2',
    connection: {
      host: getEnv('DB_HOST', '127.0.0.1'),
      port: Number(getEnv('DB_PORT', '3306')),
      user: getEnv('DB_USER', 'root'),
      password: getEnv('DB_PASSWORD', ''),
      database: getEnv('DB_NAME', 'milkman'),
    },
    pool: { min: 0, max: 10 },
    migrations: {
      tableName: 'knex_migrations',
    },
  });

  Model.knex(db);
  console.log('Database connected');
  return db;
};

export const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};
