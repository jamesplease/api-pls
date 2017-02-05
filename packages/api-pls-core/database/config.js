'use strict';

module.exports = function(options) {
  var ssl = options.ssl ? '?ssl=true' : '';
  return `${options.DATABASE_URL}${ssl}`;
};
