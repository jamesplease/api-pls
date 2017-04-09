const path = require('path');
const configureDb = require('../../packages/api-pls-postgres-adapter/database');

global.fixturesDirectory = path.join(__dirname, '..', 'fixtures');

// We need to set up the database to be in the test environment.
configureDb({test: true});
