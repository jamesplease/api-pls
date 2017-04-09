'use strict';

const _ = require('lodash');
const Ajv = require('ajv');
const modelSchema = require('./resource-model-schema');
const nonSerializableFields = require('./non-serializable-fields');

const ajv = new Ajv({allErrors: true, v5: true});
const validator = ajv.compile(modelSchema);

// This module accepts a non-normalized `resourceModel`, and will return true
// if it a valid model, or false otherwise.
module.exports = function(resource) {
  // For now, we just omit the non-serializable fields.
  const fieldsToValidate = _.omit(resource, nonSerializableFields);

  return validator(fieldsToValidate);
};
