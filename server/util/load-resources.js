const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const log = require('./log');

const cwd = process.cwd();
const resourceDirectory = process.argv[2];
const resourceDir = path.join(cwd, resourceDirectory);

function loadResource(filename) {
  const filePath = path.join(resourceDir, filename);
  const fileExt = path.extname(filePath);
  const fileBasename = path.basename(filePath, fileExt);
  const resourceName = fileBasename.toLowerCase();

  let doc;
  try {
    doc = yaml.safeLoad(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    log.warn({resourceName}, 'Resource file could not be parsed.');
  }

  return doc;
}

module.exports = function() {
  log.info({resourceDir}, 'Loading resources...');
  const resources = fs.readdirSync(resourceDir).map(loadResource);
  const resourceNames = resources.map(resource => resource.name);
  log.info({resourceNames}, 'Resources loaded.');

  return resources;
}
