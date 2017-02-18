'use strict';

const Ajv = require('ajv');
const modelSchema = require('./resource-model-schema');

const ajv = new Ajv({allErrors: true, v5: true});
const validator = ajv.compile(modelSchema);

// This module accepts a non-normalized `resourceModel`, and will return true
// if it a valid model, or false otherwise.
module.exports = function(resource) {
  return validator(resource);
};
