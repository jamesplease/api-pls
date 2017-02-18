'use strict';

const _ = require('lodash');
const pgp = require('pg-promise');

// I need to update this to at least use pgp's formatting library, and possibly
// also a templating language. This is bad, I know.

const idAttr = 'id SERIAL PRIMARY KEY';

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

function getTriggers(resource) {
  const triggers = [];
  if (resource.meta.updated_at) {
    const query = pgp.as.format(
      `CREATE TRIGGER updated_at BEFORE UPDATE ON $[resourceName~]
      FOR EACH ROW EXECUTE PROCEDURE updated_at();`, {
        resourceName: resource.name
      });

    triggers.push(query);
  }

  return triggers;
}

// At the moment this only supports
function generateRelationRow(relation) {
  const columnBaseName = relation.name;
  let nullable = '';
  if (!relation.nullable) {
    nullable = 'NOT NULL';
  }

  let unique = '';
  if (relation.relationship === 'one-to-one') {
    unique = 'UNIQUE';
  }

  const query = pgp.as.format(`$[columnName~] INTEGER references $[tableName~](id) ${nullable} ${unique}`, {
    columnName: `${columnBaseName}_id`,
    tableName: relation.resource
  });

  return `  ${query}`;
}

module.exports = function(resource) {
  const triggers = getTriggers(resource);

  const idAttrColumn = [idAttr];
  const attrs = _.map(resource.attributes, generateAttrRow);
  const meta = _.map(resource.meta, generateAttrRow);
  // Remove non-hosted relationships. Those are useful for the API, but not
  // needed for the database.
  const hostRelationships = _.pickBy(resource.relationships, {host: true});
  const relationships = _.map(hostRelationships, generateRelationRow);

  const allColumns = idAttrColumn.concat(attrs, meta, relationships);

  const createTableQuery = pgp.as.format('CREATE TABLE $[resourceName~]', {
    resourceName: resource.name
  });

  return `${createTableQuery} (
  ${allColumns.join(',\n')}
);
${triggers.join('\n\n')}`;
};
