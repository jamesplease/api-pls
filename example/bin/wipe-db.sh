#! /usr/bin/env node

// This file removes all tables from the example database. This will not only
// destroy all data, but it removes careen's migration history.

const envPath = global.ENV_PATH ? global.ENV_PATH : '.env';
require('dotenv').config({path: envPath});

const db = require('../../server/util/db');

db.query(`DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
COMMENT ON SCHEMA public IS 'standard public schema';`)
  .then(() => {
    console.log('\nThe database has been wiped.\n');
    process.exit();
  })
  .catch(() => {
    console.log('\nThere was an error while wiping the database.\n');
    process.exit(1);
  });
