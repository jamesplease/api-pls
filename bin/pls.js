#! /usr/bin/env node

'use strict';

const _ = require('lodash');
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
  DATABASE_URL: process.env.DATABASE_URL,
  port: 5000
});

options = Object.assign(options, {
  // We set the migrations direction in here, as well. This is so that the
  // program can find the base migrations common to all api-pls DBs.
  migrationsDirectory: path.join(__dirname, '..', 'migrations')
});

program.version('0.8.0', '-v, --version');

// Not all of the CLI option names line up with the value from plsrc. This
// makes sure that they do line up.
function transformProgramOptions(program) {
  program.resourcesDirectory = program.resources;
  program.DATABASE_URL = program.database;
  return program;
}

program
  .command('migrate')
  .description('Build and run resource migrations')
  .action(() => {
    options = _.defaults(transformProgramOptions(program), options);
    migrate(options);
  });

program
  .command('reset-database')
  .description('Remove all data from the database')
  .action(() => {
    options = _.defaults(transformProgramOptions(program), options);
    resetDatabase(options);
  });

program
  .command('start')
  .description('Start the API')
  .action(() => {
    options = _.defaults(transformProgramOptions(program), options);
    start(options);
  });

function parseBoolean(val) {
  if (val === 'false' || val === '0') {
    return false;
  } else {
    return true;
  }
}

program
  .option('-d, --database <url>', 'specify the database URL to connect to')
  .option('-p, --port <n>', 'set the webserver port', parseInt)
  .option('-r, --resources <path>', 'the directory where your resource models exist')
  .option('-s, --ssl <boolean>', 'whether or not to connect to the DB with SSL', parseBoolean);

program.parse(process.argv);
