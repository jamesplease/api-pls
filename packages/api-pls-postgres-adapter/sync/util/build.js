'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const VError = require('verror');
const depGraph = require('./resource-dependency-graph');
const buildSingleMigration = require('../../sql/build-single-migration');
const loadResourceModels = require('../../../api-pls-utils/resource-model/load-from-disk');
const generateDefinitions = require('../../../api-pls-utils/resource-definition/generate-from-raw');
const validateResourceModel = require('../../../api-pls-utils/resource-model/validate');

// Returns an array of migrations to apply. Throws an Error if a migration
// cannot be created.
module.exports = function(resourcesDir) {
  // Load our resources. This will sort them based on their file name,
  // which won't work when we run migrations. This is because relationships
  // require that the migrations be run in the correct order.
  const resources = loadResourceModels(resourcesDir);

  if (!resources.length) {
    return [];
  }

  // Attempt to catch errors early on by validating the model that the
  // user has input.
  const invalidResources = _.reject(resources, validateResourceModel);

  if (invalidResources.length) {
    throw new VError({
      name: 'ResourceModelValidationFailed',
      info: {
        invalidResources
      }
    });
  }

  const definitions = generateDefinitions(resources);

  // Sort the resources based on their relationships.
  let migrationOrder;

  try {
    migrationOrder = depGraph(definitions);
  } catch (e) {
    throw new VError({
      name: 'DependencyGraphError',
      cause: e
    });
  }

  // Retrieve the function migration, which is common to all DBs
  const fnMigrationPath = path.join(__dirname, '..', '..', 'sql', 'functions-migration.sql');
  const fnMigration = fs.readFileSync(fnMigrationPath, {encoding: 'utf8'});

  // Create our up migrations. We assume that the resource has never
  // existed. Eventually, we will need to first diff the resource
  // against the previous version, then pass that diff into a method
  // to get the migration!
  const migrations = migrationOrder.map(buildSingleMigration);

  // Ensure that the function migration is added
  migrations.unshift(fnMigration);

  return migrations;
};
