/* eslint-disable no-console */
const dotenv = require('dotenv');
const knexFactory = require('knex');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const knexConfig = require('../knexfile');

dotenv.config();

const knex = knexFactory(knexConfig);

const MOBILE = '8408013399';
const PIN = '123456';
const ROLE = 'super_admin'; // role code 1 = super_admin

async function upsertUser() {
  const pinHash = await bcrypt.hash(PIN, 10);
  const existing = await knex('users').where({ mobile: MOBILE }).first();

  if (existing) {
    await knex('users')
      .where({ id: existing.id })
      .update({
        pin_hash: pinHash,
        role: ROLE,
        status: 'active',
        updated_at: knex.fn.now(),
      });
    console.log(`Updated existing user ${existing.id}`);
    return existing.id;
  }

  const id = randomUUID();

  await knex('users').insert({
    id,
    name: 'Super Admin',
    email: 'user8408013399@milkman.test',
    mobile: MOBILE,
    pin_hash: pinHash,
    role: ROLE,
    status: 'active',
    last_login_at: knex.fn.now(),
  });

  console.log(`Created new user ${id}`);
  return id;
}

upsertUser()
  .then(() => knex.destroy())
  .catch(async (error) => {
    console.error('Error creating user:', error);
    await knex.destroy();
    process.exit(1);
  });

