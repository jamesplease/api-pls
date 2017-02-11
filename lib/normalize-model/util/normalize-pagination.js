'use strict';

const _ = require('lodash');

module.exports = function(pagination) {
  const options = {
    enabled: true,
    default_page_size: 10,
    default_page_number: 1
  };

  // This is the short-hand syntax:
  // `pagination: false`
  if (pagination === false) {
    options.enabled = false;
    return options;
  }

  return _.defaults(pagination, options);
};
