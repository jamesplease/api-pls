#! /usr/bin/env node

// This file removes any old migrations, from the last time that the example
// was run. This allows us to shut down the app, make changes to our resources,
// then start it up to get an entirely new app for the new resources.

const path = require('path');
const del = require('del');

del([
  // Get rid of all migrations
  path.join(__dirname, '..', 'migrations', '*'),
  // ...except for the built-in functions migration, which is used for built-in
  // attributes
  `!${path.join(__dirname, '..', 'migrations', '0.functions.sql')}`
])
  .then(() => {
    // There seemed to be a race condition between `del` completely removing
    // these files from the directory, and careen reading them. What would
    // happen is that careen's read of the directory would return the old file
    // names, but by the time it tried to read them, they would be gone. This
    // artificial delay decreases the likelihood of careen exploding.
    // Once we move to a system where the migrations aren't stored on the disk,
    // this will no longer be an issue.
    setTimeout(() => {
      console.log('\nAny existing migrations have been deleted.\n');
      process.exit();
    }, 1000);
  })
  .catch(() => {
    console.log('\nThere was an error while deleting any pre-existing migrations.\n');
    process.exit(1);
  });
