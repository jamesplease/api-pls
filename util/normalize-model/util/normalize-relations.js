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
    related.resource = relation.resource;
    related.relationship = relation.relationship;
  }

  return related;
}

module.exports = function(relations) {
  return _.mapValues(relations, normalizeRelations);
};
