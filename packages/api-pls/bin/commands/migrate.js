'use strict';

const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');
const loadResourceModels = require('api-pls-util/load-resource-models');
const buildMigrations = require('api-pls-util/build-migrations');

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

      console.log(chalk.grey('Building migrations...'));

      const migrationsDir = options.migrationsDirectory;
      const resourcesDir = options.resourcesDirectory;
      const resources = loadResourceModels(resourcesDir);

      const fnMigration = fs.readFileSync(path.join(migrationsDir, 'functions.sql'), {encoding: 'utf8'});

      // Create our up migrations. We assume that the resource has never
      // existed. Eventually, we will need to first diff the resource
      // against the previous version, then pass that diff into a method
      // to get the migration!
      const migrations = resources.map(resource => buildMigrations(resource));

      migrations.unshift(fnMigration);

      console.log(chalk.green('✔ Migrations successfully built.'));
      console.log(chalk.grey('Running migrations...'));

      const db = require('../../database');
      const query = db.$config.pgp.helpers.concat(migrations);
      db.query(query)
        .then(() => {
          console.log(chalk.green('✔ Migrations successfully run. The database is up to date.'));
        })
        .catch((e) => {
          console.log(chalk.red('There was an error while running the migrations.', e));
        });
    });
};
