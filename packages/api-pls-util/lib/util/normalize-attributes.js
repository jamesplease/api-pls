'use strict';

const _ = require('lodash');

function normalizeAttribute(attribute, attrName) {
  const attr = {};

  // This handles the short-hand syntax:
  //
  // attributes: {
  //   description: 'VARCHAR(30)'
  // }
  //
  if (_.isString(attribute)) {
    attr.type = attribute;
    attr.nullable = true;
  }

  // This handles the long-hand syntax:
  //
  // attributes: {
  //   description: {
  //     type: 'VARCHAR(30)',
  //     nullable: false
  //   }
  // }
  //
  else {
    // Types must be strings.
    if (!_.isString(attribute.type)) {
      throw new Error(`Invalid type for attribute "${attrName}". A String is required.`);
    }
    attr.type = attribute.type;

    // Ensure nullable is a Boolean, defaulting to `true`.
    if (!_.isUndefined(attribute.nullable)) {
      attr.nullable = Boolean(attribute.nullable);
    } else {
      attr.nullable = true;
    }
  }

  return attr;
}

module.exports = function(attributes) {
  return _.mapValues(attributes, normalizeAttribute);
};
