'use strict';

const _ = require('lodash');
const adjustResourceQuantity = require('./adjust-resource-quantity');

module.exports = function(result, resource) {
  const response = {};
  _.forEach(resource.relations, (relation, columnBase) => {
    const columnName = `${columnBase}_id`;
    const id = result[columnName];

    if (id) {
      response[columnBase] = {
        type: adjustResourceQuantity.getPluralName(relation.resource),
        id
      };
    }
  });

  return response;
};
