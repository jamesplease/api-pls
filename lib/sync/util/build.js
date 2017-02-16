'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const VError = require('verror');
const loadResourceModels = require('../../load-resource-models');
const validateResourceModel = require('../../validate-resource-model');
const normalizeModel = require('../../normalize-model');
const depGraph = require('./resource-dependency-graph');
const buildSingleMigration = require('./build-single-migration');
const fillRelationships = require('../../fill-relationships');

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

  // If everything checks out, then we can normalize our resource
  // to get it into a common format.
  const normalizedResources = resources.map(normalizeModel);

  // Ensure that all non-hosts of relationships also have the relationships
  // defined.
  const filledResources = fillRelationships(normalizedResources);

  // Sort the resources based on their relationships.
  let migrationOrder;

  try {
    migrationOrder = depGraph(filledResources);
  } catch (e) {
    throw new VError({
      name: 'DependencyGraphError',
      cause: e
    });
  }

  // Retrieve the function migration, which is common to all DBs
  const migrationsDir = path.join(__dirname, 'functions-migration.sql');
  const fnMigration = fs.readFileSync(migrationsDir, {encoding: 'utf8'});

  // Create our up migrations. We assume that the resource has never
  // existed. Eventually, we will need to first diff the resource
  // against the previous version, then pass that diff into a method
  // to get the migration!
  const migrations = migrationOrder.map(resource => buildSingleMigration(resource));

  // Ensure that the function migration is added
  migrations.unshift(fnMigration);

  return migrations;
};
