'use strict';

const _ = require('lodash');
const uniquelyIdentifyValidation = require('./util/uniquely-identify-validation');
const requireId = require('./util/require-id-validation');
const typesToFormatsMap = require('./util/types-to-formats-map');

function generateCreateOrUpdateForAttribute(attr, isCreate) {
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
    if (isCreate && _.isUndefined(attr.defaultValue)) {
      validation.required = true;
    }
  }

  return validation;
}

function generateCreateOrUpdateValidation(pluralResourceName, attributes, isCreate) {
  const validation = {
    type: 'object',
    // There must be *something* to update.
    required: true,
    properties: {
      body: {
        type: 'object',
        // JSON API requires that at least "type" be present.
        required: true,
        properties: {
          data: {
            type: 'object',
            properties: {
              type: {
                required: true,
                type: 'string',
                pattern: `^${pluralResourceName}$`
              },
              // Attributes are optional.
              attributes: {
                properties: _.mapValues(attributes, attr => generateCreateOrUpdateForAttribute(attr, isCreate))
              }
            }
          }
        }
      }
    }
  };

  if (!isCreate) {
    // When updating, **something** must be updated.
    validation.properties.body.oneOf = [
      {required: ['data']},
      {required: ['meta']},
      {required: ['relationships']}
    ];
    // Also, an ID must be provided in the body to uniquely identify the
    // resource.
    validation.properties.body.properties.id = requireId;
    // Lastly, we merge in the
    return _.merge(validation, uniquelyIdentifyValidation);
  }

  return validation;
}

// `attributes` is an object of objects from a resource definition file.
module.exports = function({plural_form, attributes}) {
  return {
    create: generateCreateOrUpdateValidation(plural_form, attributes, true),
    readOne: uniquelyIdentifyValidation,
    // Nothing is required to perform a readMany. Eventually, I may want to add
    // checks that certain params (for pagination, for instance) adhere to a
    // particular format or type. But for now, those aren't supported.
    readMany: {},
    update: generateCreateOrUpdateValidation(plural_form, attributes, false),
    delete: uniquelyIdentifyValidation
  };
};
