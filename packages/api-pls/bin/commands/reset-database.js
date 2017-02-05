'use strict';

const path = require('path');
const del = require('del');
const chalk = require('chalk');
const inquirer = require('inquirer');
const deleteMigrations = require('../util/delete-migrations');

// TODO: Remove this usage of dotenv. This needs to get passed in through
// the rc file or some other means.
const envPath = global.ENV_PATH ? global.ENV_PATH : '.env';
require('dotenv').config({path: envPath});

function performWipe() {
  const db = require('../../database');

  console.log(chalk.grey('Resetting the database...'));

  // This performs the wiping of the database.
  const wipeDb = db.query(`DROP SCHEMA public CASCADE;
  CREATE SCHEMA public;
  GRANT ALL ON SCHEMA public TO postgres;
  GRANT ALL ON SCHEMA public TO public;
  COMMENT ON SCHEMA public IS 'standard public schema';`);

  Promise.all([wipeDb, deleteMigrations()])
    .then(() => {
      console.log(chalk.green('✔ The database has been reset.'));
      process.exit();
    })
    .catch(() => {
      console.log(chalk.red('There was an error while cleaning up the previous example.'));
      process.exit(1);
    });
}

module.exports = function() {
  inquirer.prompt([{
      type: 'confirm',
      name: 'confirmation',
      message: 'Are you sure? This will completely wipe your database. It cannot be undone.',
      default: false
    }])
    .then(function(answers) {
      if (answers.confirmation) {
        performWipe();
      }
    });
};
