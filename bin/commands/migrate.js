'use strict';

const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');
const loadResourceModels = require('../../util/load-resource-models');
const buildMigrations = require('../../util/build-migrations');
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

      const migrationsDir = options.migrationsDirectory;
      const resourcesDir = options.resourcesDirectory;

      log(
        chalk.grey('Building migrations...'),
        options,
        chalk.grey(`Loading resources from "${path.resolve(resourcesDir)}"`)
      );

      const resources = loadResourceModels(resourcesDir);

      const fnMigration = fs.readFileSync(path.join(migrationsDir, 'functions.sql'), {encoding: 'utf8'});

      // Create our up migrations. We assume that the resource has never
      // existed. Eventually, we will need to first diff the resource
      // against the previous version, then pass that diff into a method
      // to get the migration!
      const migrations = resources.map(resource => buildMigrations(resource));

      // Ensure that the function migration is added
      migrations.unshift(fnMigration);

      log(
        chalk.green('✔ Migrations successfully built.'),
        options,
        chalk.grey(`Migrations: ${migrations.join('\n\n')}`)
      );

      log(chalk.grey('Running migrations...'), options);

      const db = require('../../database')(options);
      const query = db.$config.pgp.helpers.concat(migrations);
      db.query(query)
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
              chalk.red('Re-run this command with --verbose to see more information about this problem.'),
              options
            );
          }

          process.exit(1);
        });
    });
};
