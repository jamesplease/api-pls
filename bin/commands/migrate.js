'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');
const loadResourceModels = require('../../util/load-resource-models');
const buildMigrations = require('../../util/build-migrations');
const depGraph = require('../../util/resource-dependency-graph');
const validateResourceModel = require('../../util/validate-resource-model');
const normalizeModel = require('../../util/normalize-model');
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

      // Load our resources. This will sort them based on their file name,
      // which won't work when we run migrations. This is because relationships
      // require that the migrations be run in the correct order.
      const resources = loadResourceModels(resourcesDir);

      if (!resources.length) {
        log(
          chalk.grey('No resources found. Nothing to do.'),
          options
        );
        return;
      }

      // Attempt to catch errors early on by validating the model that the
      // user has input.
      const invalidResources = _.reject(resources, validateResourceModel);
      if (invalidResources.length) {
        log(
          chalk.red('At least one resource model was invalid.'),
          options,
          chalk.red('Invalid resource models:', invalidResources.map(r => r.name).join(', '))
        );

        if (!options.verbose) {
          log(
            chalk.red('Run this command with --verbose to see more information about this error.'),
            options
          );
        }

        return;
      }

      // If everything checks out, then we can normalize our resource
      // to get it into a common format.
      const normalizedResources = resources.map(normalizeModel);

      // Sort the resources based on their relationships.
      const migrationOrder = depGraph(normalizedResources);

      // This is our function migration, which is common to all DBs
      const fnMigration = fs.readFileSync(path.join(migrationsDir, 'functions.sql'), {encoding: 'utf8'});

      // Create our up migrations. We assume that the resource has never
      // existed. Eventually, we will need to first diff the resource
      // against the previous version, then pass that diff into a method
      // to get the migration!
      const migrations = migrationOrder.map(resource => buildMigrations(resource));

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
              chalk.red('Run this command with --verbose to see more information about this error.'),
              options
            );
          }

          process.exit(1);
        });
    });
};
