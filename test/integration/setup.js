const configureDb = require('../../lib/database');

// We need to set up the database to be in the test environment.
configureDb({test: true});
