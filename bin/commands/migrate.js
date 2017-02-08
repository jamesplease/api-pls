'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');
const getDb = require('../../database');
const migrations = require('../../lib/migrations');
const log = require('../util/log');

module.exports = function(options) {
  inquirer.prompt([{
    type: 'confirm',
    name: 'confirmation',
    message: 'Would you like to build and run migrations? This cannot be undone',
    default: false
  }])
    .then((answers) => {
      if (!answers.confirmation) {
        return;
      }

      const resourcesDir = options.resourcesDirectory;

      log(
        chalk.grey('Building migrations...'),
        options,
        chalk.grey(`Loading resources from "${path.resolve(resourcesDir)}"`)
      );

      if (!fs.existsSync(resourcesDir)) {
        log(
          chalk.red('The resource directory specified does not exist.'),
          options,
          chalk.red(`Looked for resources in: "${path.resolve(resourcesDir)}"`)
        );

        if (!options.verbose) {
          log(
            chalk.red('Run this command with --verbose to see more information about this error.'),
            options
          );
        }

        return;
      }

      // TODO: handle errors here.
      const migrationStrings = migrations.build(resourcesDir);

      log(
        chalk.green('✔ Migrations successfully built.'),
        options,
        chalk.grey(`Migrations: ${migrationStrings.join('\n\n')}`)
      );

      log(chalk.grey('Running migrations...'), options);

      const db = getDb(options);
      migrations.apply(db, migrationStrings)
        .then(() => {
          log(chalk.green('✔ Migrations successfully run. The database is up to date.'), options);
          process.exit();
        })
        .catch((e) => {
          log(
            chalk.red('There was an error while running the migrations.'),
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
    });
};
