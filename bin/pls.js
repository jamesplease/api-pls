#! /usr/bin/env node

'use strict';

const rc = require('rc');
const path = require('path');
const program = require('commander');
const migrate = require('./commands/migrate');
const resetDatabase = require('./commands/reset-database');
const start = require('./commands/start');

const envPath = global.ENV_PATH ? global.ENV_PATH : '.env';
require('dotenv').config({path: envPath});

// Load up our configuration, passing the defaults in.
let options = rc('pls', {
  resourcesDirectory: './resources',
  ssl: true,
  DATABASE_URL: process.env.DATABASE_URL
});

options = Object.assign(options, {
  migrationsDirectory: path.join(__dirname, '..', 'migrations')
});

program.version('0.8.0', '-v, --version');

program
  .command('migrate')
  .description('Build and run resource migrations')
  .action(() => {
    migrate(options);
  });

program
  .command('reset-database')
  .description('Remove all data from the database.')
  .action(() => {
    resetDatabase(options);
  });

program
  .command('start')
  .description('Start the API.')
  .action(() => {
    start(options);
  });

program.parse(process.argv);
