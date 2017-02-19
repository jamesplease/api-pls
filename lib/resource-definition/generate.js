'use strict';

const _ = require('lodash');
const sqlUtil = require('../sql/sql-util');
const buildJsonSchema = require('./build-json-schema');

// Some of the properties of the Resource Models are objects, because that
// minimizes the typing that a human has to do. But they are more useful to us
// as an array, so we convert those things to an array here.
// For instance, attributes:
//
// attributes:
//   first_name:
//     type: 'VARCHAR(30)'
//
// becomes...
//
// {
//   attributes: [
//     {
//       name: 'first_name',
//       type: 'VARCHAR(30)'
//     }
//   ]
// }
//
// You can customize the "key" with the second argument (it defaults to "name")
function mapObjToArray(obj, key = 'name') {
  return _.map(obj, (v, k) => Object.assign(v, {[key]: k}));
}

// Maps a Model to its Definition
function generateDefinition(model) {
  const arrayRelationships = mapObjToArray(model.relationships);

  return {
    name: model.name,
    plural_form: model.plural_form,
    tableName: {
      raw: sqlUtil.getTableName(model),
      escaped: sqlUtil.getTableName(model, {escaped: true}),
    },
    idColumnName: {
      raw: sqlUtil.getIdColumnFromResource(model),
      escaped: sqlUtil.getIdColumnFromResource(model, {escaped: true}),
    },
    actions: model.actions,
    // This should probably be calculated here, rather than put on the model.
    validations: buildJsonSchema(model),
    pagination: model.pagination,
    attributeNames: Object.keys(model.attributes),
    attributes: mapObjToArray(model.attributes),
    relationshipNames: Object.keys(model.relationships),
    relationships: arrayRelationships,
    hostRelationships: _.filter(arrayRelationships, 'host'),
    guestRelationships: _.reject(arrayRelationships, 'host'),
    metaNames: Object.keys(model.meta),
    meta: mapObjToArray(model.meta),
    builtInMetaNames: Object.keys(model.built_in_meta),
    builtInMeta: mapObjToArray(model.built_in_meta),
    // Also attach the normalized model, just in case.
    model
  };
}

// Resource Definitions are "enhanced" versions of the Resource Model. They're
// transformed slightly to be more useful to the server, and a handful of
// computed properties goes on the Definition.
module.exports = function(resourceModels) {
  const baseDefinition = _.map(resourceModels, generateDefinition);

  // Now that we have all of our definitions, we can link them as necessary
  // based on their relationships. This will help us build queries that involve
  // relationships.
  return _.map(baseDefinition, (definition, index, definitions) => {
    // Find all of the resources that this resource is related to, and put them
    // into an array.
    const definitionsInRelationships = _.chain(definition.relationships)
      .map((relationship) => {
        return _.find(definitions, {name: relationship.resource});
      })
      // A resource may have multiple relationships with another resource. Remove
      // duplicates from this array, since one reference is all we need here.
      .uniq()
      .value();

    return Object.assign(definition, {definitionsInRelationships});
  });
};
