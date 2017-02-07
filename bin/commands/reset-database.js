'use strict';

const chalk = require('chalk');
const inquirer = require('inquirer');
const log = require('../util/log');

function performWipe(options) {
  const db = require('../../database')(options);

  log(
    chalk.grey('Resetting the database...'),
    options,
    {
      databaseUrl: options.DATABASE_URL,
      ssl: options.ssl
    }
  );

  db.query(`DROP SCHEMA public CASCADE;
  CREATE SCHEMA public;
  GRANT ALL ON SCHEMA public TO postgres;
  GRANT ALL ON SCHEMA public TO public;
  COMMENT ON SCHEMA public IS 'standard public schema';`)
    .then(() => {
      log(chalk.green('✔ The database has been reset.'), options);
      process.exit();
    })
    .catch((e) => {
      log(
        chalk.red('There was an error while cleaning up the previous example.'),
        options,
        e
      );

      if (!options.verbose) {
        log(
          chalk.red('Run this command with --verbose to see more information about this error.'),
          options
        );
      }

      process.exit(1);
    });
}

module.exports = function(options) {
  inquirer.prompt([{
    type: 'confirm',
    name: 'confirmation',
    message: 'Are you sure? This will completely wipe your database. It cannot be undone.',
    default: false
  }])
    .then((answers) => {
      if (answers.confirmation) {
        performWipe(options);
      }
    });
};
