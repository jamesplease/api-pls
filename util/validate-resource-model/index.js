'use strict';

const isMyJsonValid = require('is-my-json-valid');
const modelSchema = require('./util/resource-model-schema');

const validator = isMyJsonValid(modelSchema);

// This module accepts a non-normalized `resourceModel`, and will return true
// if it a valid model, or false otherwise.
module.exports = function(resource) {
  return validator(resource);
};
