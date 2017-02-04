#! /usr/bin/env node

const path = require('path');
const del = require('del');
const chalk = require('chalk');

const envPath = global.ENV_PATH ? global.ENV_PATH : '.env';
require('dotenv').config({path: envPath});

const db = require('../../server/util/db');

console.log(chalk.gray('Cleaning up previous example (if one exists)...'));

// This file removes all tables from the example database. This will not only
// destroy all data, but it removes careen's migration history.
const wipeDb = db.query(`DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
COMMENT ON SCHEMA public IS 'standard public schema';`);

// This file removes any old migrations, from the last time that the example
// was run. This allows us to shut down the app, make changes to our resources,
// then start it up to get an entirely new app for the new resources.
const deleteMigrations = del([
  // Get rid of all migrations
  path.join(__dirname, '..', 'migrations', '*'),
  // ...except for the built-in functions migration, which is used for built-in
  // attributes
  `!${path.join(__dirname, '..', 'migrations', '0.functions.sql')}`
]);

Promise.all([wipeDb, deleteMigrations])
  .then(() => {
    console.log(chalk.green('✔ Any previous example has been cleaned up.\n'));
    process.exit();
  })
  .catch(() => {
    console.log(chalk.red('There was an error while cleaning up the previous example.\n'));
    process.exit(1);
  });
