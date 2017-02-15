'use strict';

const _ = require('lodash');
const pgp = require('pg-promise');

// I need to update this to at least use pgp's formatting library, and possibly
// also a templating language. This is bad, I know.

const idAttr = 'id SERIAL PRIMARY KEY';

function generateAttrRow(value, attrName, prefix = '') {
  if (typeof prefix === 'string') {
    attrName = prefix + attrName;
  }
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

// At the moment this only works for many-to-one relationships. The others will
// require more complex updates to my migration building procedure.
function generateRelationRow(relation, columnBaseName) {
  let nullable = '';
  if (!relation.nullable) {
    nullable = ' NOT NULL';
  }

  const query = pgp.as.format(`$[columnName~] INTEGER references $[tableName~](id) ${nullable}`, {
    columnName: `${columnBaseName}_id`,
    tableName: relation.resource
  });

  return `  ${query}`;
}

module.exports = function(resource) {
  const triggers = getTriggers(resource);

  const idAttrColumn = [idAttr];
  const attrs = _.map(resource.attributes, generateAttrRow);
  const meta = _.map(resource.meta, (meta, key) => generateAttrRow(meta, key, 'meta_'));
  const relationships = _.map(resource.relationships, generateRelationRow);

  const allColumns = idAttrColumn.concat(attrs, meta, relationships);

  const createTableQuery = pgp.as.format('CREATE TABLE $[resourceName~]', {
    resourceName: resource.name
  });

  return `${createTableQuery} (
  ${allColumns.join(',\n')}
);
${triggers.join('\n\n')}`;
};
