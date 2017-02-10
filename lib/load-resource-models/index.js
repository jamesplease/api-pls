'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// This function reads and parses the resource from the disk, and returns it.
// At the moment, only YAML files are supported, although it'd be simple to add
// in support for JSON.
function loadResource(filename, resourcesDir) {
  const extname = path.extname(filename);
  const filePath = path.join(resourcesDir, filename);
  const fileContents = fs.readFileSync(filePath, 'utf8');

  // Empty files are simply ignored.
  if (!fileContents) {
    return null;
  }

  if (extname === '.yaml' || extname === '.yml') {
    return yaml.safeLoad(fileContents);
  } else {
    return JSON.parse(fileContents);
  }
}

// Attempts to read the resource models in `resourcesDir`. This will throw an
// Error if any of them are invalid YAML.
module.exports = function(resourcesDir) {
  // Loop through all files in the directory
  return fs.readdirSync(resourcesDir)
    // Open them up and parse them as JSON
    .map(r => loadResource(r, resourcesDir))
    // Filter out any files that have no content
    .filter(r => r);
};
