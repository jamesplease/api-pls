#! /usr/bin/env node

'use strict';

const _ = require('lodash');
const fs = require('fs');
const rc = require('rc');
const path = require('path');
const program = require('commander');
const sync = require('./commands/sync');
const resetDatabase = require('./commands/reset-database');
const start = require('./commands/start');

const envPath = global.ENV_PATH ? global.ENV_PATH : '.env';
require('dotenv').config({path: envPath});

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJsonString = fs.readFileSync(packageJsonPath, {encoding: 'utf-8'});
const packageJson = JSON.parse(packageJsonString);

// Load up our configuration, passing the defaults in.
let options = rc('pls', {
  resourcesDirectory: './resources',
  ssl: true,
  DATABASE_URL: process.env.DATABASE_URL,
  port: 5000
});

program.version(packageJson.version, '-v, --version');

// Not all of the CLI option names line up with the value from plsrc. This
// makes sure that they do line up.
function transformProgramOptions(program) {
  program.resourcesDirectory = program.resources;
  program.DATABASE_URL = program.database;
  return program;
}

program
  .command('sync')
  .description('Synchronize the database with Resource Model definitions')
  .action(() => {
    options = _.defaults(transformProgramOptions(program), options);
    sync(options);
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
  .option('-s, --ssl <boolean>', 'whether or not to connect to the DB with SSL', parseBoolean)
  .option('--silent', 'disable logging')
  .option('--verbose', 'enable verbose logging');

program.parse(process.argv);
