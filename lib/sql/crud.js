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

  // Default fields to an asterisk
  fields = fields ? fields : '*';
  var columns = pgp.as.name(fields);

  let totalCountQuery = '';
  if (enablePagination) {
    totalCountQuery = ', COUNT(*) OVER () AS total_count';
  }

  // Add in the host tables here after the WITH's are added.
  const tablesToPullFrom = [definition.tableName.raw];

  let withClauses = '';
  if (id) {
    withClauses += _.map(definition.relationshipsInHostTable, relationship => {
      // Find the related resource for this relationship
      const related = _.find(definition.definitionsInRelationships, {name: relationship.resource});
      // Add a virtual table to our tables to select from
      tablesToPullFrom.push(sqlUtil.getVirtualHostTableName(relationship));
      // Generate our with statement to create the virtual table
      return sqlUtil.getWithStatement({
        relatedResource: related,
        resource: definition,
        id,
        relationship
      });
    }).join(', ');

    if (withClauses) {
      withClauses = `WITH ${withClauses}`;
    }
  }

  const tables = pgp.as.name(tablesToPullFrom);
  const baseQuery = `${withClauses} SELECT ${columns} ${totalCountQuery} FROM ${tables}`;

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
