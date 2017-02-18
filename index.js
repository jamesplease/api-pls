'use strict';

const _ = require('lodash');
const database = require('./lib/database');
const startServer = require('./lib/start-server');
const sync = require('./lib/sync');
const normalizeModel = require('./lib/resource-model/normalize');
const buildJsonSchema = require('./lib/resource-definition/build-json-schema');
const loadResourceModels = require('./lib/resource-model/load-from-disk');
const validateResourceModel = require('./lib/resource-model/validate');
const wipeDatabase = require('./lib/database/wipe');

// Options are all of the valid options for api-pls. Refer to the documentation
// for the full list.
function ApiPls(options) {
  options = _.defaults(options, {
    connectWithSsl: true,
    resourcesDirectory: './resources',
    port: 5000,
    apiVersion: 1,
    verbose: false,
    silent: false
  });

  this.options = {
    ssl: options.connectWithSsl,
    DATABASE_URL: options.databaseUrl,
    resourcesDirectory: options.resourcesDirectory,
    port: options.port,
    apiVersion: options.apiVersion,
    verbose: options.verbose,
    silent: options.silent
  };

  this.db = database(this.options);
}

// Start the server with the passed-in options.
ApiPls.prototype.start = function() {
  startServer(this.options);
};

// Load resources, build SQL statements from them, run them.
// Returns a Promise that resolves if the operation is a success, or rejects
// if the operation fails.
ApiPls.prototype.sync = function() {
  const resourcesDir = this.options.resourcesDirectory;
  const migrationStrings = sync.build(resourcesDir);
  return sync.apply(this.db, migrationStrings);
};

// Clear the database.
// Returns a Promise that resolves if the operation is a success, or rejects
// if the operation fails.
ApiPls.prototype.dangerouslyResetDatabase = function() {
  return wipeDatabase(this.db);
};

// Nifty utilities that you may find useful.
ApiPls.normalizeModel = normalizeModel;
ApiPls.buildJsonSchema = buildJsonSchema;
ApiPls.loadResourceModels = loadResourceModels;
ApiPls.validateResourceModel = validateResourceModel;

module.exports = ApiPls;
