const _ = require('lodash');
const uniquelyIdentifyValidation = require('./uniquely-identify-validation');
const requireId = require('./require-id-validation');
const typesToFormatsMap = require('./types-to-formats-map');

function generateUpdateForAttribute(attr) {
  const validation = {};

  // Attempt to enforce a JSON Schema `format`, based on the attribute's
  // Postgres type.
  var format = typesToFormatsMap[attr.type];
  if (format) {
    validation.format = format;
  }

  // Enforce the attribute's nullable property
  if (attr.nullable === false) {
    validation.not = {
      type: 'null'
    };
  }

  return validation;
}

function generateUpdateValidation(attributes) {
  const validation = {
    type: 'object',
    // There must be *something* to update.
    required: true,
    properties: {
      body: {
        type: 'object',
        // Once again, we must have something in the body so that we can make a
        // change.
        required: true
      }
    }
  };

  validation.properties.body.properties = _.mapValues(attributes, generateUpdateForAttribute);

  // Ensure that the resource is uniquely identified by the request.
  return _.merge(validation, uniquelyIdentifyValidation);
}

// `attributes` is an object of objects from a resource definition file.
module.exports = function(attributes) {
  return {
    create: {},
    readOne: uniquelyIdentifyValidation,
    readMany: {},
    update: generateUpdateValidation(attributes),
    delete: uniquelyIdentifyValidation
  };
};
