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
// `hostResource`: the host of the relationship
// `relationship`: The "guest" relationship; the one on `resource` referring to
//   `hostResource`
// `id`: The specific `resource` ID that is being requested.
module.exports = function({resource, hostResource, relationship, id}) {
  const isManyToMany = relationship.cardinality === relationshipUtil.cardinality.manyToMany;
  const escaped = {escaped: true};
  const virtualTableName = sqlUtil.getVirtualHostTableName(relationship, escaped);

  let hostTableName;
  if (!isManyToMany) {
    hostTableName = sqlUtil.getTableName(hostResource, escaped);
  } else {
    hostTableName = manyToManyUtil.getAssociativeTableName({
      guest: resource,
      host: hostResource,
      escaped: true
    });
  }

  let relatedIdColumn;
  if (!isManyToMany) {
    relatedIdColumn = sqlUtil.getIdColumnFromResource(hostResource, escaped);
  } else {
    relatedIdColumn = manyToManyUtil.getHostIdColumnName({host: hostResource, escaped: true});
  }

  const hostRelationship = _.find(hostResource.relationships, {resource: resource.name});

  let foreignKeyColumn;
  if (!isManyToMany) {
    foreignKeyColumn = sqlUtil.getRelationshipColumnName(hostRelationship, escaped);
  } else {
    foreignKeyColumn = manyToManyUtil.getGuestIdColumnName({guest: resource, escaped: true});
  }
  // Of course, the notion of a "guest foreign key" doesn't really exist. But
  // that is effectively what this value is representing.

  const guestForeignKeyColumn = sqlUtil.getRelationshipColumnName(relationship, escaped);

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
