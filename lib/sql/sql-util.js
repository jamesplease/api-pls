'use strict';

const pgp = require('pg-promise');
const relationshipUtil = require('../relationship-util');

// Given a `resource`, returns the table name for it.
// Pass `{escaped: true}` as options to escape the table name.
function getTableName(resource, options = {}) {
  const {escaped} = options;
  const rawName = resource.name;
  return escaped ? pgp.as.name(rawName) : rawName;
}

// `id` is the only name for an ID table currently supported.
// Pass `{escaped: true}` as options to escape the name.
function getIdColumnFromResource(resource, options = {}) {
  const {escaped} = options;
  return escaped ? pgp.as.name('id') : 'id';
}

// Many things related to relationships use a table or column suffixed with
// "_id" or "_ids". Pass in a relationship, and you'll get the right suffix
// to use for that relationship.
function getIdSuffix(relationship) {
  let idSuffix = 'id';
  if (relationshipUtil.isToMany(relationship)) {
    idSuffix += 's';
  }
  return idSuffix;
}

// This returns the column name for a relationship. For instance, if a
// `person` has a guest relationship called `pets` with a `cat` resource,
// then this would return `pet_ids`.
//
// On the other hand, if the person-cat relationship was one-to-one, it would be
// `pet_id`.
function getRelationshipColumnName(relationship, options = {}) {
  const {escaped} = options;
  const idSuffix = getIdSuffix(relationship);
  const rawName = `${relationship.name}_${idSuffix}`;
  return escaped ? pgp.as.name(rawName) : rawName;
}

// This is the table name given to the result of the WITH clause when accessing
// a host relationship in "one-to-many" or "one-to-one"
function getVirtualHostTableName(relationship, options = {}) {
  const {escaped} = options;
  const idSuffix = getIdSuffix(relationship);
  const resourceName = relationship.resource;
  const rawName = `related_${resourceName}_${idSuffix}`;
  return escaped ? pgp.as.name(rawName) : rawName;
}

module.exports = {
  getTableName, getIdColumnFromResource, getIdSuffix, getRelationshipColumnName,
  getVirtualHostTableName
};
