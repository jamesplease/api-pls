const fs = require('fs');
const path = require('path');
const log = require('./log');

const cwd = process.cwd();
const resourceDirectory = process.argv[2];

module.exports = function() {
  const resourceDir = path.join(cwd, resourceDirectory);
  log.info({resourceDir}, 'About to load resources.');

  const resources = fs.readdirSync(resourceDir)
    .map(function(filename) {
      const filePath = path.join(resourceDir, filename);
      const fileExt = path.extname(filePath);
      const fileBasename = path.basename(filePath, fileExt);
      const resourceName = fileBasename.toLowerCase();
      return resourceName;
    });
  log.info({resources}, 'Successfully loaded resources.');

  return resources;
}
