'use strict';

const _ = require('lodash');
const builtInMeta = require('../../built-in-meta');

module.exports = function(builtInMetaAttributes) {
  const meta = {};
  _.forEach(builtInMetaAttributes, (include, metaName) => {
    if (include) {
      meta[metaName] = builtInMeta[metaName];
    }
  });
  return meta;
};
