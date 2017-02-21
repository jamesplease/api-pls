'use strict';

const _ = require('lodash');
const sqlUtil = require('./sql-util');

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

  let withClauses = '';
  const escaped = {escaped: true};
  if (id) {
    withClauses += _.map(definition.relationshipsInHostTable, relationship => {
      const hostResource = _.find(definition.definitionsInRelationships, {name: relationship.resource});
      const hostRelationship = _.find(hostResource.relationships, {resource: definition.name});

      const guestTableName = sqlUtil.getTableName(definition, escaped);
      const guestIdColumnName = sqlUtil.getIdColumnFromResource(definition, escaped);
      const virtualTableName = sqlUtil.getVirtualHostTableName(relationship, escaped);
      const foreignKeyColumn = sqlUtil.getRelationshipColumnName(hostRelationship, escaped);
      const guestForeignKeyColumn = sqlUtil.getRelationshipColumnName(relationship, escaped);
      if (id) {
        columns += `, (SELECT ${guestForeignKeyColumn} FROM ${virtualTableName}) AS ${guestForeignKeyColumn}`;
      } else {
        columns += `, (SELECT
          ${guestForeignKeyColumn} FROM ${virtualTableName}
          WHERE ${guestTableName}.${guestIdColumnName} = ${virtualTableName}.${foreignKeyColumn}) AS ${guestForeignKeyColumn}`;
      }

      // Find the related resource for this relationship
      // Generate our with statement to create the virtual table
      return sqlUtil.getWithStatement({
        resource: definition,
        hostResource, id, relationship
      });
    }).join(', ');

    if (withClauses) {
      withClauses = `WITH ${withClauses}`;
    }
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
