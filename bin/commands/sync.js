'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const VError = require('verror');
const getDb = require('../../lib/database');
const sync = require('../../lib/sync');
const log = require('../util/log');

module.exports = function(options) {
  let confirmation;

  if (options.force) {
    confirmation = Promise.resolve({confirmation: true});
  } else {
    confirmation = inquirer.prompt([{
      type: 'confirm',
      name: 'confirmation',
      message: 'Are you sure you wish to sync your database? This cannot be undone.',
      default: false
    }]);
  }

  confirmation.then((answers) => {
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
    let migrationStrings;
    try {
      migrationStrings = sync.build(resourcesDir);
    } catch(e) {
      if (e.name === 'YAMLParseError') {
        const info = VError.info(e);
        log.error(`Building the migrations failed: Could not parse "${info.filename}" as YAML.`);
      } else if (e.name === 'JSONParseError') {
        const info = VError.info(e);
        log.error(`Building the migrations failed: Could not parse "${info.filename}" as JSON.`);
      } else if (e.name === 'DependencyGraphError') {
        const cause = VError.cause(e);
        if (_.startsWith(e.message, ': Dependency Cycle Found:')) {
          const rest = _.replace(e.message, ': Dependency Cycle Found: ', '');
          log.error(`Building the migrations failed, because a circular dependency was found: ${rest}.`);
          log.error('This is often caused by defining a relationship in two Resource Models, rather than one.');
          log.error('For more on setting up relationships, see the documentation: https://github.com/jmeas/api-pls/wiki/Relationships');
        } else if (_.startsWith(e.message, ': Node does not exist:')) {
          const rest = _.replace(e.message, ': Node does not exist: ', '');
          log.error(`Building the migrations failed, a Resource Model could not be found: "${rest}".`);
          log.error('This may be a bug in api-pls. Please file an issue at:');
          log.error('https://github.com/jmeas/api-pls/issues/new?title=Building+migrations:+my+resource+model+could+not+be+found');
        } else {
          log.error('Building the migrations failed.');
          log.error('This may be a bug in api-pls. Please file an issue at:');
          log.error('https://github.com/jmeas/api-pls/issues/new?title=Building+migrations:+my+resource+model+could+not+be+found');
        }
      } else {
        log.error('Building the migrations failed.');
      }
      log.debug(e);
      process.exit(1);
    }

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
