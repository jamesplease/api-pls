'use strict';

const _ = require('lodash');

// Yeah I'm building this text migration in JS. Fight me!
// No but really, I should probably move this into a Handlebars template or
// something more sane.

const builtInAttributes = {
  created_at: '  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP',
  updated_at: '  updated_at TIMESTAMPTZ'
};

const idAttr = 'id SERIAL PRIMARY KEY';

function generateAttrRow(value, attrName) {
  let nullable = '';
  if (!value.nullable) {
    nullable = ' NOT NULL';
  }
  return `  ${attrName} ${value.type} ${nullable}`;
}

function getAttrs(resource) {
  // By default, everything will have the same ID (for now)
  let attrs = [idAttr];

  const attrStrings = _.map(resource.attributes, generateAttrRow);

  // Merge in our attributes
  attrs = attrs.concat(attrStrings);

  // Push our built in attributes
  _.forEach(resource.built_in_attributes, (include, attrName) => {
    if (include) {
      attrs.push(builtInAttributes[attrName]);
    }
  });

  return attrs;
}

function getTriggers(resource) {
  const triggers = [];
  if (resource.built_in_attributes.updated_at) {
    triggers.push(
`CREATE TRIGGER updated_at BEFORE UPDATE ON ${resource.name}
  FOR EACH ROW EXECUTE PROCEDURE updated_at();`
);
  }

  return triggers;
}

module.exports = function(resource) {
  const triggers = getTriggers(resource);
  const attrs = getAttrs(resource);

  return `CREATE TABLE ${resource.name} (
  ${attrs.join(',\n')}
);

${triggers.join('\n\n')}

---

DROP TABLE ${resource.name};
  `;
};
