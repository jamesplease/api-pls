'use strict';

const database = require('./lib/database');
const startServer = require('./lib/start-server');
const migrations = require('./lib/migrations');
const normalizeModel = require('./lib/normalize-model');
const buildJsonSchema = require('./lib/build-json-schema');
const loadResourceModels = require('./lib/load-resource-models');
const validateResourceModel = require('./lib/validate-resource-model');
const wipeDatabase = require('./lib/wipe-database');

// Options are all of the valid options for api-pls. Refer to the documentation
// for the full list.
function ApiPls(options) {
  this.options = {
    ssl: options.connectWithSsl,
    DATABASE_URL: options.databaseUrl,
    resourcesDirectory: options.resourcesDirectory,
    port: options.port
  };

  this.db = database(this.options);
}

// Start the server with the passed-in options.
ApiPls.prototype.start = function() {
  startServer(this.options);
};

// Load resources, build migrations, apply them.
// Returns a Promise that resolves if the operation is a success, or rejects
// if the operation fails.
ApiPls.prototype.migrate = function() {
  const resourcesDir = this.options.resourcesDirectory;
  const migrationStrings = migrations.build(resourcesDir);
  return migrations.apply(this.db, migrationStrings);
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
