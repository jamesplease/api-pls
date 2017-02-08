'use strict';

const _ = require('lodash');

module.exports = function(pagination) {
  const options = {
    enabled: true,
    defaultPageSize: 10,
    defaultPageNumber: 0
  };

  // This is the short-hand syntax:
  // `pagination: false`
  if (pagination === false) {
    options.enabled = false;
    return options;
  }

  return _.defaults(pagination, options);
};
