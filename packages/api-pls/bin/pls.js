#! /usr/bin/env node

const program = require('commander');
const rc = require('rc');
const migrate = require('./commands/migrate');
const resetDatabase = require('./commands/reset-database');
const start = require('./commands/start');

// Load up our configuration, passing the defaults in.
var conf = rc('pls', {
  resourcesDirectory: "./resources"
});

program
  .command('migrate')
  .description('Build and run resource migrations')
  .action(function() {
    migrate();
  });

program
  .command('reset-database')
  .description('Remove all data from the database.')
  .action(function() {
    resetDatabase();
  });

program
  .command('start')
  .description('Start the API.')
  .action(function() {
    start();
  });

program.parse(process.argv);
