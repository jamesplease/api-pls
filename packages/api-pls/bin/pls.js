#! /usr/bin/env node

const rc = require('rc');
const path = require('path');
const program = require('commander');
const migrate = require('./commands/migrate');
const resetDatabase = require('./commands/reset-database');
const start = require('./commands/start');

// Load up our configuration, passing the defaults in.
let options = rc('pls', {
  resourcesDirectory: "./resources"
});

options = Object.assign(options, {
  migrationsDirectory: path.join(__dirname, '..', 'migrations')
});

program
  .command('migrate')
  .description('Build and run resource migrations')
  .action(function() {
    migrate(options);
  });

program
  .command('reset-database')
  .description('Remove all data from the database.')
  .action(function() {
    resetDatabase(options);
  });

program
  .command('start')
  .description('Start the API.')
  .action(function() {
    start(options);
  });

program.parse(process.argv);
