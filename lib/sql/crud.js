'use strict';

const _ = require('lodash');
const sqlUtil = require('./sql-util');
const withStatement = require('./with-statement');

// The functions in this file return CRUD queries to be passed into pg-promise.

exports.create = function({tableName, attrs, db}) {
  const baseQuery = db.$config.pgp.helpers.insert(attrs, null, tableName);
  return `${baseQuery} RETURNING *`;
};

// `fields` are the columns to return. You can pass in an array, such as
// ['first_name', 'last_name'],
// or an asterisk to get everything: '*'.
// By default, the asterisk is used.
exports.read = function({definition, fields, db, id, pageSize, pageNumber, enablePagination}) {
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
    const otherResource = _.find(definition.definitionsInRelationships, {name: relationship.resource});
    const otherRelationship = _.find(otherResource.relationships, {resource: definition.name});

    const selfTableName = sqlUtil.getTableName(definition, escaped);
    const selfIdColumnName = sqlUtil.getIdColumnFromResource(definition, escaped);
    const virtualTableName = sqlUtil.getVirtualHostTableName(relationship, escaped);
    const otherForeignKeyColumn = sqlUtil.getRelationshipColumnName(otherRelationship, escaped);
    const selfForeignKeyColumn = sqlUtil.getRelationshipColumnName(relationship, escaped);
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

  let endQuery = '';
  if (id) {
    endQuery = pgp.as.format('WHERE id=$[id]', {id});
  }

  return `${baseQuery} ${paginationQuery} ${endQuery}`;
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
