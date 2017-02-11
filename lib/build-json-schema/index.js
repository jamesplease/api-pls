'use strict';

const _ = require('lodash');
const uniquelyIdentifyValidation = require('./util/uniquely-identify-validation');
const requireId = require('./util/require-id-validation');
const typesToFormatsMap = require('./util/types-to-formats-map');

function generateCreateOrUpdateForAttribute(attr) {
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
  }

  return validation;
}

function generateCreateOrUpdateValidation(pluralResourceName, attributes, isCreate) {
  const validation = {
    type: 'object',
    // There must be *something* to update.
    required: ['body'],
    properties: {
      body: {
        type: 'object',
        // JSON API requires that at least "type" be present.
        properties: {
          data: {
            type: 'object',
            required: ['type'],
            properties: {
              type: {
                type: 'string',
                pattern: `^${pluralResourceName}$`
              },
              // Attributes are optional.
              attributes: {
                properties: _.mapValues(attributes, generateCreateOrUpdateForAttribute)
              }
            }
          }
        }
      }
    }
  };

  if (!isCreate) {
    // When updating, **something** must be updated.
    validation.properties.body.properties.data.oneOf = [
      {required: ['attributes']},
      {required: ['meta']},
      {required: ['relationships']}
    ];
    // Also, an ID must be provided in the body to uniquely identify the
    // resource.
    validation.required = ['body', 'params'];
    // For patch updates, an ID is required in `body.data`.
    validation.properties.body.properties.data.properties.id = requireId;
    // This enforces that the ID in the URL matches what was passed in the body.
    validation.properties.params = {
      type: 'object',
      required: ['id'],
      properties: {
        id: {
          constant: {$data: '2/body/data/id'}
        }
      }
    };
    return validation;
  }

  // If we're creating a resource, then we need to make sure that the non-
  // nullable attributes exist on the request. Filter to find them.
  var requiredArray = Object.keys(attributes).filter(attr => {
    const attrIsNullable = attributes[attr].nullable === false;
    const noDefault = _.isUndefined(attributes[attr].defaultValue);
    return attrIsNullable && noDefault;
  });

  // ajv explodes if the `required` property is an empty Array, so we only add
  // this to the schema if there's at least one value.
  if (requiredArray.length) {
    validation.properties.body.properties.data.properties.attributes.required = requiredArray;
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
