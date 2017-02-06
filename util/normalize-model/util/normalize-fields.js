'use strict';

const _ = require('lodash');

function normalizeField(field, fieldName) {
  const attr = {};

  // This handles the short-hand syntax:
  //
  // fields: {
  //   description: 'VARCHAR(30)'
  // }
  //
  if (_.isString(field)) {
    attr.type = field;
    attr.nullable = true;
    attr.default = null;
  }

  // This handles the long-hand syntax:
  //
  // fields: {
  //   description: {
  //     type: 'VARCHAR(30)',
  //     nullable: false
  //   }
  // }
  //
  else {
    // Types must be strings.
    if (!_.isString(field.type)) {
      throw new Error(`Invalid type for field "${fieldName}". A String is required.`);
    }
    attr.type = field.type;

    // Ensure nullable is a Boolean, defaulting to `true`.
    if (!_.isUndefined(field.nullable)) {
      attr.nullable = Boolean(field.nullable);
    } else {
      attr.nullable = true;
    }

    attr.default = field.default ? field.default : null;
  }

  return attr;
}

module.exports = function(fields) {
  return _.mapValues(fields, normalizeField);
};
