'use strict';

const _ = require('lodash');
const sqlUtil = require('../sql/sql-util');
const buildJsonSchema = require('./build-json-schema');
const relationshipUtil = require('../relationship-util');

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
  const relationships = _.cloneDeep(model.relationships);
  const arrayRelationships = mapObjToArray(relationships);

  const hostRelationships = _.filter(arrayRelationships, 'host');
  const guestRelationships = _.reject(arrayRelationships, 'host');

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
    // All of the relationships that this definition hosts
    hostRelationships,
    // All of the guest relationships
    guestRelationships,
    // These are the relationships that are stored in the database as foreign
    // keys in this definition's table
    relationshipsInOwnTable: _.filter(arrayRelationships, relationshipUtil.isStoredInOwnTable),
    // These relationships are stored as foreign keys in _another_ resource's
    // table
    relationshipsInHostTable: _.filter(arrayRelationships, relationshipUtil.isStoredInHostTable),
    externallyStoredRelationships: _.reject(arrayRelationships, relationshipUtil.isStoredInOwnTable),
    // These are relationships that exist in an associative table
    relationshipsInAssociativeTable: _.filter(arrayRelationships, relationshipUtil.isStoredInAssociativeTable),
    // These are the associative table relationships that this resource hosts
    hostedAssociativeTableRelationships: _.filter(hostRelationships, relationshipUtil.isStoredInAssociativeTable),
    metaNames: Object.keys(model.meta),
    meta: mapObjToArray(model.meta),
    builtInMetaNames: Object.keys(model.built_in_meta),
    builtInMeta: mapObjToArray(model.built_in_meta),
    isAuthorized: model.is_authorized,
    // Also attach the normalized model, just in case.
    model,
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
    _.forEach(definition.relationships, r => {
      r.relatedDefinition = _.find(definitions, {name: r.resource});
    });

    return definition;
  });
};
