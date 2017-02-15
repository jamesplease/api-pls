'use strict';

const _ = require('lodash');
const pgMetadata = require('pg-metadata');
const database = require('../database');

// This returns information about the forign keys of the table, separately
// from the information about each column in the table. We mash them together
// in `mergeResults` to get a more complete picture of the column.
function getForeignKeyColumnQuery(table) {
  return `SELECT conrelid::regclass AS "table_name"
      ,CASE WHEN pg_get_constraintdef(c.oid) LIKE 'FOREIGN KEY %' THEN substring(pg_get_constraintdef(c.oid), 14, position(')'
          in pg_get_constraintdef(c.oid))-14) END AS "column_name"
      ,CASE WHEN pg_get_constraintdef(c.oid) LIKE 'FOREIGN KEY %' THEN substring(pg_get_constraintdef(c.oid),
      position(' REFERENCES ' in pg_get_constraintdef(c.oid))+12,
      position('(' in substring(pg_get_constraintdef(c.oid), 14))-position(' REFERENCES ' in pg_get_constraintdef(c.oid))+1)
      END AS "related_table"
  FROM   pg_constraint c
  JOIN   pg_namespace n ON n.oid = c.connamespace
  WHERE  contype IN ('f', 'p ')
  AND pg_get_constraintdef(c.oid) LIKE 'FOREIGN KEY %'
  AND    c.conrelid = '${table}'::regclass
  ORDER BY pg_get_constraintdef(c.oid), conrelid::regclass::text, contype DESC;`;
}

// `columns` is an array of, well, columns. But the array comes from two
// queries: one for general column info, the other for foreign key constraints.
// This merges any two objects that have the same "column_name" to get a unified
// definition.
function mergeResults(columns) {
  return _.chain(columns)
    .groupBy('column_name')
    .map(group => _.reduce(group, _.merge))
    .value();
}

module.exports = function(tables) {
  const db = database();

  // This generates two queries: one for a general column description, the other
  // for foreign key information.
  const queries = _.map(tables, table => {
    const allColumnsQuery = pgMetadata.createQuery({table});
    const foreignKeyQuery = getForeignKeyColumnQuery(table);
    return [allColumnsQuery, foreignKeyQuery];
  });
  const query = db.$config.pgp.helpers.concat(_.flatten(queries));

  return db.query(query)
    .then(result => {
      const groups = _.groupBy(result, 'table_name');
      return _.mapValues(groups, mergeResults);
    })
    .catch(e => console.log('error', e));
};
