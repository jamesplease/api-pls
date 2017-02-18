'use strict';

const _ = require('lodash');
const pgp = require('pg-promise');
const relationshipUtil = require('./relationship-util');

// Given a `resource`, returns the table name for it.
// Pass `{escaped: true}` as a second argument to get a value safe for direct
// input into a query.
function getTableName(resource, {escaped} = {}) {
  const rawName = resource.name;
  return escaped ? pgp.as.name(`${rawName}`) : rawName;
}

// `id` is the only name for an ID table currently supported.
function getIdColumnFromResource() {
  return pgp.as.name('id');
}

// Many things related to relationships use a table or column suffixed with
// "_id" or "_ids". Pass in a relationship, and you'll get the right suffix
// to use for that relationship.
function getIdSuffix(relationship) {
  let idSuffix = 'id';
  if (relationshipUtil.isToMany(relationship.relationship)) {
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
function getRelationshipColumnName(relationship) {
  const idSuffix = relationshipUtil.getIdSuffix(relationship);
  return pgp.as.name(`${relationship.name}_${idSuffix}`);
}

// This is the table name given to the result of the WITH clause when accessing
// a host relationship in "one-to-many" or ""
function getHostTableName(relationship) {
  const idSuffix = relationshipUtil.getIdSuffix(relationship);
  const resourceName = relationship.resource;
  return pgp.as.name(`related_${resourceName}_${idSuffix}`);
}

// Returns a query that aids with fetching relationship data that is stored
// in a host table (one-to-many and one-to-one relationships).
//
// `resource`: The resource that is being requested
// `relatedResource`: the host of the relationship
// `relationship`: The "guest" relationship; the one on `resource` referring to
//   `relatedResource`
// `id`: The specific `resource` ID that is being requested.
function getWithStatement({resource, relatedResource, relationship, id}) {
  const hostTableName = getHostTableName(relationship);
  const relatedTableName = getTableName(relatedResource);
  const relatedIdColumn = getIdColumnFromResource(relatedResource);
  const hostRelationship = _.find(relatedResource.relationships, {resource: resource.name});
  const hostColumnName = getRelationshipColumnName(hostRelationship);
  const safeId = pgp.as.value(id);

  return `WITH
    ${hostTableName} AS (
      SELECT array(
        SELECT ${relatedIdColumn}
          FROM ${relatedTableName}
          WHERE ${hostColumnName}=${safeId}
      ) AS ${hostColumnName}
    )`;
}

module.exports = {
  getTableName, getIdColumnFromResource, getIdSuffix, getRelationshipColumnName,
  getHostTableName, getWithStatement
};