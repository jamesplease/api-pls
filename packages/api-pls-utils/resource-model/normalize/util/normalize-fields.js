'use strict';

const _ = require('lodash');

function normalizeField(field) {
  const attr = {};

  // This handles the short-hand syntax:
  //
  // fields: 'VARCHAR(30)'
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
