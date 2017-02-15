'use strict';

const _ = require('lodash');

// Parenthesis refers to the values in the parentheses in these types:
// "VARCHAR(30)"
// "NUMERIC(9,2)"
// Does this cover all of the values? Probably not. I need to make sure that it
// does.
function getParenthesis(column) {
  if (column.udt_name === 'varchar') {
    if (column.character_maximum_length) {
      return `(${column.character_maximum_length})`;
    }
  } else if (column.udt_name === 'numeric') {
    const precisionAndScale = [];
    const {numeric_precision, numeric_scale} = column;
    if (numeric_precision) {
      precisionAndScale.push(numeric_precision);
    }
    if (numeric_scale) {
      precisionAndScale.push(numeric_scale);
    }
    if (precisionAndScale.length) {
      return `(${precisionAndScale.join(',')})`;
    }
  }

  return '';
}

function generateAttributes(columns) {
  const attrColumns = _.filter(columns, c => {
    // `id` is never an attribute.
    if (c.column_name === 'id') {
      return false;
    }

    else if (c.related_table) {
      return false;
    }

    // `meta_{name}` column names is reserved for meta properties
    else if (_.startsWith(c.column_name, 'meta_')) {
      return false;
    }

    return true;
  });

  return _.chain(attrColumns)
    .mapKeys(val => val.column_name)
    .mapValues(val => {
      return {
        type: `${val.udt_name.toUpperCase()}${getParenthesis(val)}`,
        nullable: val.is_nullable === 'YES'
      };
    })
    .value();
}

function generateMeta(columns) {
  const metaColumns = _.chain(columns)
    .filter(c => /^meta_/.test(c.column_name))
    .filter(c => (c.column_name !== 'meta_updated_at' && c.column_name !== 'meta_created_at'))
    .value();

  return _.chain(metaColumns)
    .mapKeys(val => val.column_name.replace(/^meta_/, ''))
    .mapValues(val => {
      return {
        type: `${val.udt_name.toUpperCase()}${getParenthesis(val)}`,
        nullable: val.is_nullable === 'YES'
      };
    })
    .value();
}

function generateRelationships(columns) {
  const relatedColumns = _.pickBy(columns, 'related_table');

  return _.chain(relatedColumns)
    .mapKeys(val => val.column_name.replace(/_id$/, ''))
    .mapValues(val => {
      return {
        resource: val.related_table,
        nullable: val.is_nullable === 'YES',
        // This will require some more complex analysis once I support
        // many-to-many and one-to-one!
        relationship: 'many-to-one'
      };
    })
    .value();
}

module.exports = function({columns, currentModel}) {
  const result = Object.assign({}, currentModel, {
    attributes: generateAttributes(columns),
    relationships: generateRelationships(columns),
    meta: generateMeta(columns),
    built_in_meta: {
      updated_at: Boolean(_.find(columns, {column_name: 'meta_updated_at'})),
      created_at: Boolean(_.find(columns, {column_name: 'meta_created_at'})),
    }
  });

  return result;
};
