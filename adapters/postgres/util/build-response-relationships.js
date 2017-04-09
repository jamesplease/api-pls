'use strict';

const _ = require('lodash');
const sqlUtil = require('../../../lib/sql/sql-util');
const manyToManyUtil = require('../../../lib/sql/many-to-many-util');
const relationshipUtil = require('../../../lib/relationship-util');

function formatToOneResult({result, definition, value, version, columnBase, relation}) {
  const id = value ? String(value) : null;
  const relatedObject = {
    links: {
      self: `/v${version}/${definition.plural_form}/${result.id}/relationships/${columnBase}`
    }
  };

  // If something is associated, then we can add more information.
  if (id) {
    const pluralRelated = adjustResourceQuantity.getPluralName(relation.resource);
    relatedObject.links.related = `/v${version}/${definition.plural_form}/${result.id}/${columnBase}`;
    relatedObject.data = {
      type: pluralRelated,
      id
    };
  }

  return relatedObject;
}

function formatToManyResult({result, definition, value, version, columnBase, relation}) {
  // Ensure that all of the IDs are strings.
  const ids = _.map(value, id => String(id));

  const relatedObject = {
    links: {
      self: `/v${version}/${definition.plural_form}/${result.id}/relationships/${columnBase}`
    }
  };

  if (ids.length) {
    relatedObject.links.related = `/v${version}/${definition.plural_form}/${result.id}/${columnBase}`;
    relatedObject.data = ids.map(v => {
      return {
        id: v,
        type: adjustResourceQuantity.getPluralName(relation.resource)
      };
    });
  }

  return relatedObject;
}

function findOwnRelationships(result, definition, version) {
  return _.reduce(definition.relationshipsInOwnTable, (memo, relation) => {
    const columnBase = relation.name;
    const columnName = sqlUtil.getRelationshipColumnName(relation);
    const value = result[columnName];
    // Relationships in this table can necessarily only be a single value, as
    // that means it is stored as a foreign key.
    const relatedObject = formatToOneResult({result, definition, version, value, columnBase, relation});
    memo[columnBase] = relatedObject;
    return memo;
  }, {});
}

function findHostedRelationships(result, definition, version) {
  return _.reduce(definition.relationshipsInHostTable, (memo, relation) => {
    const columnBase = relation.name;
    const columnName = sqlUtil.getRelationshipColumnName(relation);
    const value = result[columnName];

    const isToMany = relationshipUtil.isToMany(relation);
    const args = {result, definition, version, value, columnBase, relation};
    const relatedObject = isToMany ? formatToManyResult(args) : formatToOneResult(args);

    memo[columnBase] = relatedObject;
    return memo;
  }, {});
}

function findAssociatedRelationships(result, definition, version) {
  return _.reduce(definition.relationshipsInAssociativeTable, (memo, relation) => {
    const otherResource = relation.relatedDefinition;
    const columnBase = adjustResourceQuantity.getPluralName(relation.resource);
    let columnName;
    if (!relation.host) {
      columnName = manyToManyUtil.getHostIdColumnName({host: otherResource});
    } else {
      columnName = manyToManyUtil.getGuestIdColumnName({guest: otherResource});
    }
    const value = result[columnName];

    const isToMany = relationshipUtil.isToMany(relation);
    const args = {result, definition, version, value, columnBase, relation};
    const relatedObject = isToMany ? formatToManyResult(args) : formatToOneResult(args);

    memo[columnBase] = relatedObject;
    return memo;
  }, {});
}

module.exports = function(result, definition, version) {
  const hostedRelationships = findOwnRelationships(result, definition, version);
  const otherHostedRelationships = findHostedRelationships(result, definition, version);
  const associatedRelationships = findAssociatedRelationships(result, definition, version);

  return Object.assign(hostedRelationships, otherHostedRelationships, associatedRelationships);
};
