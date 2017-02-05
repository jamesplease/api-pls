'use strict';

const path = require('path');
const del = require('del');

// Deletes all migration files. Eventually, these will be stored in the database
// itself, but currently all migration tools require them to be on the
// filesystem.
module.exports = function() {
  return del([
    // Get rid of all migrations
    path.join(__dirname, '..', '..', 'migrations', '*'),
    // ...except for the built-in functions migration, which is used for built-in
    // attributes
    `!${path.join(__dirname, '..', '..', 'migrations', '0.functions.sql')}`
  ], {
    // This is necessary because these files are sometimes outside of the CWD;
    // for instance, when the example is run from within the monorepo.
    force: true
  });
};
