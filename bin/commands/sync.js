'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const getDb = require('../../lib/database');
const sync = require('../../lib/sync');
const log = require('../util/log');

module.exports = function(options) {
  inquirer.prompt([{
    type: 'confirm',
    name: 'confirmation',
    message: 'Are you sure you wish to sync your database? This cannot be undone.',
    default: false
  }])
    .then((answers) => {
      if (!answers.confirmation) {
        return;
      }

      const resourcesDir = options.resourcesDirectory;
      log.info('Building migrations from Resource Models...');
      log.debug(`Loading resources from "${path.resolve(resourcesDir)}"`);

      if (!fs.existsSync(resourcesDir)) {
        log.error('The resource directory specified does not exist.');
        log.debug(`Searched for resources in: "${path.resolve(resourcesDir)}"`);

        if (log.level !== 'trace') {
          log.error('Run this command with --verbose to see more information about this error.');
        }
        return;
      }

      // TODO: handle errors here.
      const migrationStrings = sync.build(resourcesDir);
      log.success('✔ Migrations successfully built.');
      log.debug(`SQL statements: ${migrationStrings.join('\n\n')}`);

      log.info('Running migrations...');

      const db = getDb(options);
      sync.apply(db, migrationStrings)
        .then(() => {
          log.success('✔ Migrations successfully run. The database is synchronized.');
          process.exit();
        })
        .catch((e) => {
          log.error('There was an error while running the migrations.');
          log.debug(e);

          if (log.level !== 'trace') {
            log.error('Run this command with --verbose to see more information about this error.');
          }

          process.exit(1);
        });
    });
};
