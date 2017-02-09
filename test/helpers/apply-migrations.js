'use strict';

const getDb = require('../../lib/database');
const app = require('../../server/app');
const migrations = require('../../lib/migrations');

const db = getDb();

// Runs migrations from the passed-in `options.resourcesDirectory`.
// Returns a Promise that resolves when the migrations are run.
module.exports = function(options) {
  const resourcesDirectory = options.resourcesDirectory;
  const migrationStrings = migrations.build(resourcesDirectory);

  // Only apply the migrations if we have some to prevent errors.
  if (migrationStrings.length) {
    return migrations.apply(db, migrationStrings);
  }

  // If there are no migrations, then we just resolve to the app.
  else {
    return Promise.resolve();
  }
};
