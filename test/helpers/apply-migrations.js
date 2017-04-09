'use strict';

const getDb = require('../../packages/api-pls-postgres-adapter/database');
const sync = require('../../packages/api-pls-postgres-adapter/sync');

const db = getDb();

// Runs migrations from the passed-in `options.resourcesDirectory`.
// Returns a Promise that resolves when the migrations are run.
module.exports = function(options) {
  const resourcesDirectory = options.resourcesDirectory;
  const migrationStrings = sync.build(resourcesDirectory);

  // Only apply the migrations if we have some to prevent errors.
  if (migrationStrings.length) {
    return sync.apply(db, migrationStrings);
  }

  // If there are no migrations, then we just resolve to the app.
  else {
    return Promise.resolve();
  }
};
