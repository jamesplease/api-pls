'use strict';

const _ = require('lodash');
const adjustResourceQuantity = require('./adjust-resource-quantity');

module.exports = function(result, definition, version) {
  const response = {};
  _.forEach(definition.relationships, (relation) => {
    const columnBase = relation.name;
    const columnName = `${columnBase}_id`;
    const value = result[columnName];
    const id = value ? String(value) : null;

    // We always include the direct link to the relationship, even if nothing
    // is associated at the moment.
    const relatedObject = {
      links: {
        related: `/v${version}/${definition.plural_form}/${result.id}/${columnBase}`
      }
    };

    // If something is associated, then we can add more information.
    if (id) {
      const pluralRelated = adjustResourceQuantity.getPluralName(relation.resource);
      relatedObject.links.self = `/v${version}/${pluralRelated}/${id}`;
      relatedObject.data = {
        type: pluralRelated,
        id
      };
    }

    response[columnBase] = relatedObject;
  });

  return response;
};
