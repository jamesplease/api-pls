'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const loadResourceModels = require('../load-resource-models');
const validateResourceModel = require('../validate-resource-model');
const normalizeModel = require('../normalize-model');
const depGraph = require('../resource-dependency-graph');
const buildMigration = require('./util/build-migration');

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
    throw new Error('There were invalid resources');
  }

  // If everything checks out, then we can normalize our resource
  // to get it into a common format.
  const normalizedResources = resources.map(normalizeModel);

  // Sort the resources based on their relationships.
  const migrationOrder = depGraph(normalizedResources);

  // Retrieve the function migration, which is common to all DBs
  const migrationsDir = path.join(__dirname, 'util', 'functions-migration.sql');
  const fnMigration = fs.readFileSync(migrationsDir, {encoding: 'utf8'});

  // Create our up migrations. We assume that the resource has never
  // existed. Eventually, we will need to first diff the resource
  // against the previous version, then pass that diff into a method
  // to get the migration!
  const migrations = migrationOrder.map(resource => buildMigration(resource));

  // Ensure that the function migration is added
  migrations.unshift(fnMigration);

  return migrations;
};