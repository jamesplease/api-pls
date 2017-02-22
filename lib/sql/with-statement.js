'use strict';

const _ = require('lodash');
const pgp = require('pg-promise');
const relationshipUtil = require('../relationship-util');
const manyToManyUtil = require('./many-to-many-util');
const sqlUtil = require('./sql-util');

// Returns a query that aids with fetching relationship data that is stored
// in a host table (one-to-many and one-to-one relationships).
//
// `resource`: The resource that is being requested
// `otherResource`: the host of the relationship
// `relationship`: The "guest" relationship; the one on `resource` referring to
//   `otherResource`
// `id`: The specific `resource` ID that is being requested.
module.exports = function({resource, otherResource, relationship, id}) {
  const isManyToMany = relationship.cardinality === relationshipUtil.cardinality.manyToMany;
  const escaped = {escaped: true};
  const virtualTableName = sqlUtil.getVirtualHostTableName(relationship, escaped);
  const isHost = relationship.host;

  let guest, host;
  if (relationship.host) {
    host = resource;
    guest = otherResource;
  } else {
    guest = resource;
    host = otherResource;
  }

  let hostTableName;
  if (!isManyToMany) {
    hostTableName = sqlUtil.getTableName(otherResource, escaped);
  } else {
    hostTableName = manyToManyUtil.getAssociativeTableName({
      guest, host,
      escaped: true
    });
  }

  let relatedIdColumn;
  if (!isManyToMany) {
    relatedIdColumn = sqlUtil.getIdColumnFromResource(otherResource, escaped);
  } else if (!isHost) {
    relatedIdColumn = manyToManyUtil.getHostIdColumnName({host, escaped: true});
  } else {
    relatedIdColumn = manyToManyUtil.getGuestIdColumnName({guest, escaped: true});
  }

  const hostRelationship = _.find(otherResource.relationships, {resource: resource.name});

  let foreignKeyColumn;
  if (!isManyToMany) {
    foreignKeyColumn = sqlUtil.getRelationshipColumnName(hostRelationship, escaped);
  } else if (!isHost) {
    foreignKeyColumn = manyToManyUtil.getGuestIdColumnName({guest, escaped: true});
  } else {
    foreignKeyColumn = manyToManyUtil.getHostIdColumnName({host, escaped: true});
  }

  // Of course, the notion of a "guest foreign key" doesn't really exist. But
  // that is effectively what this value is representing.
  let guestForeignKeyColumn;
  if (!isManyToMany) {
    guestForeignKeyColumn = sqlUtil.getRelationshipColumnName(relationship, escaped);
  } else if (isHost) {
    guestForeignKeyColumn = manyToManyUtil.getGuestIdColumnName({guest: otherResource, escaped: true});
  } else {
    guestForeignKeyColumn = manyToManyUtil.getHostIdColumnName({host: otherResource, escaped: true});
  }

  // Filter by the ID if this is singular
  const whereStatement = id ? `WHERE ${foreignKeyColumn}=${pgp.as.value(id)}` : '';

  return `${virtualTableName} AS (
    SELECT
      ${foreignKeyColumn},
      array_agg(${relatedIdColumn}) AS ${guestForeignKeyColumn}
    FROM ${hostTableName}
    ${whereStatement}
    GROUP BY ${foreignKeyColumn}
  )`;
};
