'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const VError = require('verror');

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
    let result;
    try {
      result = yaml.safeLoad(fileContents);
    } catch (e) {
      throw new VError({
        name: 'YAMLParseError',
        cause: e,
        info: {
          filename,
          resourcesDir
        }
      });
    }
    return result;
  } else {
    let result;
    try {
      result = JSON.parse(fileContents);
    } catch (e) {
      throw new VError({
        name: 'JSONParseError',
        cause: e,
        info: {
          filename,
          resourcesDir
        }
      });
    }
    return result;
  }
}

// Attempts to read the resource models in `resourcesDir`. This will throw an
// Error if any of them have an invalid format.
module.exports = function(resourcesDir) {
  // Loop through all files in the directory
  return fs.readdirSync(resourcesDir)
    // Open them up and parse them as JSON
    .map(r => loadResource(r, resourcesDir))
    // Filter out any files that have no content
    .filter(r => r);
};
