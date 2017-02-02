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

// This could be merged with the analogous `update` function.
function generateCreateForAttribute(attr) {
  const validation = {};

  // Attempt to enforce a JSON Schema `format`, based on the attribute's
  // Postgres type.
  var format = typesToFormatsMap[attr.type];
  if (format) {
    validation.format = format;
  }

  // Enforce the attribute's nullable property
  if (attr.nullable === false) {
    // If it's not nullable, then, well, it cannot be null.
    validation.not = {
      type: 'null'
    };

    // If the attribute is not nullable, and it doesn't have a default value,
    // then it must also be a required.
    if (_.isUndefined(attr.defaultValue)) {
      validation.required = true;
    }
  }

  return validation;
}

// This could be merged with the analogous `update` function.
function generateCreateValidation(attributes) {
  const validation = {
    type: 'object',
    // There must be *something* to update.
    required: true,
    properties: {
      body: {
        type: 'object',
        // Once again, we must have something in the body so that we can make
        // the thing. This may not always be true for some edge cases...
        required: true
      }
    }
  };

  validation.properties.body.properties = _.mapValues(attributes, generateCreateForAttribute);

  return validation;
}

// `attributes` is an object of objects from a resource definition file.
module.exports = function(attributes) {
  return {
    create: generateCreateValidation(attributes),
    readOne: uniquelyIdentifyValidation,
    // Nothing is required to perform a readMany. Eventually, I may want to add
    // checks that certain params (for pagination, for instance) adhere to a
    // particular format or type. But for now, those aren't supported.
    readMany: {},
    update: generateUpdateValidation(attributes),
    delete: uniquelyIdentifyValidation
  };
};
