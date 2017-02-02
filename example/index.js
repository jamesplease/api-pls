
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const resourceTransform = require('../lib/resource-transform');

const resourceDir = path.join(__dirname, './resources');

function loadResource(filename) {
  const filePath = path.join(resourceDir, filename);
  const fileExt = path.extname(filePath);
  const fileBasename = path.basename(filePath, fileExt);
  const resourceName = fileBasename.toLowerCase();

  let doc;
  try {
    doc = yaml.safeLoad(fs.readFileSync(filePath, 'utf8'));
  } catch(e) {
    console.warn('Resource file could not be loaded');
  }

  return doc;
}

const resources = fs.readdirSync(resourceDir)
  .map(loadResource)
  .map(resourceTransform);


const resourceString = JSON.stringify(resources);

// Write JSON result to stdout. This will be consumed by the server to set up
// the routes and database.
console.log(resourceString);

// Temporarily write this out to the disk, so that we can check out our results.
fs.writeFileSync('./test.json', resourceString);
