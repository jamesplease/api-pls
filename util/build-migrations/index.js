'use strict';

const _ = require('lodash');

// I need to update this to at least use pgp's formatting library, and possibly
// also a templating language. This is bad, I know.

const idAttr = 'id SERIAL PRIMARY KEY';

function generateAttrRow(value, attrName) {
  let nullable = '';
  if (!value.nullable) {
    nullable = 'NOT NULL';
  }

  let defaultValue = '';
  if (value.default) {
    defaultValue = `DEFAULT ${value.default}`;
  }
  return `  ${attrName} ${value.type} ${nullable} ${defaultValue}`;
}

function getTriggers(resource) {
  const triggers = [];
  if (resource.meta.updated_at) {
    triggers.push(
`CREATE TRIGGER updated_at BEFORE UPDATE ON ${resource.name}
  FOR EACH ROW EXECUTE PROCEDURE updated_at();`
);
  }

  return triggers;
}

module.exports = function(resource) {
  const triggers = getTriggers(resource);

  const idAttrColumn = [idAttr];
  const attrs = _.map(resource.attributes, generateAttrRow);
  const meta = _.map(resource.meta, generateAttrRow);

  const allColumns = idAttrColumn.concat(attrs, meta);

  return `CREATE TABLE ${resource.name} (
  ${allColumns.join(',\n')}
);

${triggers.join('\n\n')}`;
};
