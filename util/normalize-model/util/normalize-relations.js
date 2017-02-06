'use strict';

const _ = require('lodash');

function normalizeRelations(relation, relatedName) {
  const related = {};

  // This handles the short-hand syntax:
  //
  // people: 'many-to-one'
  //
  if (_.isString(relation)) {
    related.relationship = relation;
    related.resource = relatedName;
  }

  // This handles the long-hand syntax:
  //
  // owner: {
  //   resource: 'people',
  //   relationship: 'many-to-one'
  // }
  //
  else {
    // Types must be strings.
    if (!_.isString(relation.resource)) {
      throw new Error(`Invalid type for relation "${relatedName}". A String is required.`);
    }
    related.resource = relation.resource;

    // Relationships must be strings.
    if (!_.isString(relation.relationship)) {
      throw new Error(`Invalid relationship for relation "${relatedName}". A String is required.`);
    }

    related.relationship = relation.relationship;
  }

  return related;
}

module.exports = function(relations) {
  return _.mapValues(relations, normalizeRelations);
};
