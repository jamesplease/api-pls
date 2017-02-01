const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const log = require('./log');
const defaultValidations = require('./default-validations');

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

  const validations = Object.assign(_.cloneDeep(defaultValidations), doc.validations);

  console.log('validations!', validations);

  return Object.assign({
    plural_form: resourceName + 's'
  }, doc, {
    validations
  });
}

module.exports = function() {
  log.info({resourceDir}, 'Loading resources...');
  const resources = fs.readdirSync(resourceDir).map(loadResource);
  const resourceNames = resources.map(resource => resource.name);
  log.info({resourceNames}, 'Resources loaded.');

  return resources;
}
