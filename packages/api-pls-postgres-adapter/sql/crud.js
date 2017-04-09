'use strict';

const _ = require('lodash');
const sqlUtil = require('./sql-util');
const manyToManyUtil = require('./many-to-many-util');
const withStatement = require('./with-statement');
const relationshipUtil = require('../../../lib/relationship-util');

// The functions in this file return CRUD queries to be passed into pg-promise.

exports.create = function({tableName, attrs, db}) {
  const baseQuery = db.$config.pgp.helpers.insert(attrs, null, tableName);
  return `${baseQuery} RETURNING *`;
};

// `fields` are the columns to return. You can pass in an array, such as
// ['first_name', 'last_name'],
// or an asterisk to get everything: '*'.
// By default, the asterisk is used.
exports.read = function({definition, fields, db, id, pageSize, pageNumber, enablePagination, req}) {
  const zeroIndexPageNumber = pageNumber - 1;
  const pgp = db.$config.pgp;

  // Default columns to an asterisk. The asterisk is namespaced with the table
  // name, as certain features, like relationships, use WITH clauses to add
  // more "tables" to the query.
  let columns = fields ? pgp.as.name(fields) : `${definition.tableName.escaped}.*`;

  let totalCountQuery = '';
  if (enablePagination) {
    totalCountQuery = ', COUNT(*) OVER () AS total_count';
  }

  const escaped = {escaped: true};
  let withClauses = _.map(definition.externallyStoredRelationships, relationship => {
    const otherResource = relationship.relatedDefinition;
    const otherRelationship = _.find(otherResource.relationships, {resource: definition.name});

    const selfTableName = sqlUtil.getTableName(definition, escaped);
    const selfIdColumnName = sqlUtil.getIdColumnFromResource(definition, escaped);
    const virtualTableName = sqlUtil.getVirtualHostTableName(relationship, escaped);

    let otherForeignKeyColumn, selfForeignKeyColumn;
    if (!relationshipUtil.isStoredInAssociativeTable(relationship)) {
      otherForeignKeyColumn = sqlUtil.getRelationshipColumnName(otherRelationship, escaped);
      selfForeignKeyColumn = sqlUtil.getRelationshipColumnName(relationship, escaped);
    } else if (!relationship.host) {
      selfForeignKeyColumn = manyToManyUtil.getHostIdColumnName({host: otherResource, escaped: true});
      otherForeignKeyColumn = manyToManyUtil.getGuestIdColumnName({guest: definition, escaped: true});
    } else {
      selfForeignKeyColumn = manyToManyUtil.getGuestIdColumnName({guest: otherResource, escaped: true});
      otherForeignKeyColumn = manyToManyUtil.getHostIdColumnName({host: definition, escaped: true});
    }

    if (id) {
      columns += `, (SELECT ${selfForeignKeyColumn} FROM ${virtualTableName}) AS ${selfForeignKeyColumn}`;
    } else {
      columns += `, (SELECT
        ${selfForeignKeyColumn} FROM ${virtualTableName}
        WHERE ${selfTableName}.${selfIdColumnName} = ${virtualTableName}.${otherForeignKeyColumn}) AS ${selfForeignKeyColumn}`;
    }

    // Find the related resource for this relationship
    // Generate our with statement to create the virtual table
    const withIt = withStatement({
      resource: definition,
      otherResource, id, relationship
    });

    return withIt;
  }).join(', ');

  if (withClauses) {
    withClauses = `WITH ${withClauses}`;
  }

  const baseQuery = `${withClauses} SELECT ${columns} ${totalCountQuery} FROM ${definition.tableName.escaped}`;

  let paginationQuery = '';
  if (enablePagination) {
    paginationQuery = pgp.as.format('LIMIT $[limit] OFFSET $[offset]', {
      limit: pageSize,
      offset: zeroIndexPageNumber * pageSize
    });
  }

  const conditions = [];

  const additionalCondition = definition.additionalCondition({
    resourceDefinition: this.definition,
    crudAction: 'readOne',
    req
  });

  if (additionalCondition) {
    conditions.push(additionalCondition);
  }

  if (id) {
    conditions.push(pgp.as.format('id=$[id]', {id}));
  }

  let conditionalQuery = '';
  if (conditions.length) {
    conditionalQuery = `WHERE ${conditions.join(' AND ')}`;
  }

  return `${baseQuery} ${conditionalQuery} ${paginationQuery}`;
};

exports.update = function({tableName, attrs, id, db}) {
  const pgp = db.$config.pgp;
  const baseQuery = pgp.helpers.update(attrs, null, tableName);
  const endQuery = pgp.as.format('WHERE id=$[id] RETURNING *', {id});
  return `${baseQuery} ${endQuery}`;
};

exports.delete = function({tableName, id, db}) {
  const pgp = db.$config.pgp;
  return pgp.as.format('DELETE FROM $[tableName~] WHERE id=$[id] RETURNING *', {
    tableName, id
  });
};
