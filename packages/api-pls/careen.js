const path = require('path');
const dbConfig = require('./config/db-config');

var config;

// Unfortunately, careen has a different signature than node-postgres.
// The dbConfig method returns correct version for node-postgres, so we
// need to manipulate it here.
if (typeof dbConfig === 'string') {
  config = {
    url: dbConfig
  };
} else {
  config = dbConfig;
}

module.exports = {
  client: {
    name: "postgresql",
    config: config
  },

  // Right now, we hard code this to use the files from the examples directory
  files: {
    directory: path.join(__dirname, 'example', 'migrations')
  }
}
