'use strict';

const _ = require('lodash');
const pgp = require('pg-promise');
const manyToManyUtil = require('./many-to-many-util');
const sqlUtil = require('./sql-util');

function generateIdColumn(definition) {
  const idColumn = sqlUtil.getIdColumnFromResource(definition, {escaped: true});
  return `${idColumn} SERIAL PRIMARY KEY`;
}

function generateAttrRow(value) {
  const attrName = value.name;
  let nullable = '';
  if (!value.nullable) {
    nullable = 'NOT NULL';
  }

  let defaultValue = '';
  if (value.default) {
    // SQL Injection could occur here from `defaultValue`
    defaultValue = pgp.as.format(`DEFAULT $[defaultValue^]`, {
      defaultValue: value.default
    });
  }

  // SQL Injection could occur here from `type`
  const query = pgp.as.format(`$[attrName~] $[type^] ${nullable} ${defaultValue}`, {
    type: value.type,
    attrName
  });

  return `  ${query}`;
}

function getTriggers(definition) {
  const triggers = [];
  if (definition.meta.updated_at) {
    const query = `CREATE TRIGGER updated_at
      BEFORE UPDATE ON ${definition.tableName.escaped}
      FOR EACH ROW EXECUTE PROCEDURE updated_at();`;

    triggers.push(query);
  }
  return triggers;
}

function generateRelationRow({relationship}) {
  const columnBaseName = relationship.name;
  let nullable = '';
  if (!relationship.nullable) {
    nullable = 'NOT NULL';
  }

  let unique = '';
  if (relationship.cardinality === 'one-to-one') {
    unique = 'UNIQUE';
  }

  const query = pgp.as.format(`$[columnName~] INTEGER references $[tableName~](id) ${nullable} ${unique}`, {
    columnName: `${columnBaseName}_id`,
    tableName: relationship.resource
  });

  return `  ${query}`;
}

module.exports = function(definition, index, definitions) {
  const triggers = getTriggers(definition);

  const idAttrColumn = generateIdColumn(definition);
  const attrs = _.map(definition.attributes, generateAttrRow);
  const meta = _.map(definition.meta, generateAttrRow);
  const builtInMeta = _.map(definition.builtInMeta, generateAttrRow);
  const relationships = _.map(
    definition.relationshipsInOwnTable,
    relationship => generateRelationRow({relationship, definition, definitions})
  );
  const allColumns = [idAttrColumn].concat(attrs, meta, builtInMeta, relationships);
  const createTableQuery = `CREATE TABLE ${definition.tableName.escaped}`;

  const associativeRels = definition.hostedAssociativeTableRelationships;
  const associativeTableQueries = _.map(
    associativeRels,
    relationship => manyToManyUtil.buildAssociativeTable({
      relationship, definition, definitions
    })
  );

  const primaryTable = `${createTableQuery} (
  ${allColumns.join(',\n')}
);
${triggers.join('\n\n')}`;

  return pgp().helpers.concat(([primaryTable]).concat(associativeTableQueries));
};
