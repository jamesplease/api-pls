'use strict';

const _ = require('lodash');

function normalizeRelationships(relation, relatedName) {
  const related = {};

  // This handles the short-hand syntax:
  //
  // people: 'many-to-one'
  //
  if (_.isString(relation)) {
    related.cardinality = relation;
    related.resource = relatedName;
    related.nullable = true;
    related.host = true;
  }

  // This handles the long-hand syntax:
  //
  // owner: {
  //   resource: 'people',
  //   cardinality: 'many-to-one'
  // }
  //
  else {
    related.resource = relation.resource;
    related.cardinality = relation.cardinality;

    // Ensure nullable is a Boolean, defaulting to `true`.
    if (!_.isUndefined(relation.nullable)) {
      related.nullable = Boolean(relation.nullable);
    } else {
      related.nullable = true;
    }

    // Ensure host is a Boolean, defaulting to `true`.
    if (!_.isUndefined(relation.host)) {
      related.host = Boolean(relation.host);
    } else {
      related.host = true;
    }
  }

  return related;
}

module.exports = function(relationships) {
  return _.mapValues(relationships, normalizeRelationships);
};
