/* eslint-disable no-console */
const dotenv = require('dotenv');
const knexFactory = require('knex');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const knexConfig = require('../knexfile');

dotenv.config();

const knex = knexFactory(knexConfig);

const MOBILE = '8408013398';
const PIN = '123456';
const ROLE = 'seller';

async function upsertSeller() {
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
    console.log(`Updated existing seller ${existing.id}`);
    return existing.id;
  }

  const id = randomUUID();

  await knex('users').insert({
    id,
    name: 'Milkman Seller',
    email: `seller${MOBILE}@milkman.test`,
    mobile: MOBILE,
    pin_hash: pinHash,
    role: ROLE,
    status: 'active',
    last_login_at: knex.fn.now(),
  });

  console.log(`Created new seller ${id}`);
  return id;
}

upsertSeller()
  .then(() => knex.destroy())
  .catch(async (error) => {
    console.error('Error creating seller user:', error);
    await knex.destroy();
    process.exit(1);
  });


