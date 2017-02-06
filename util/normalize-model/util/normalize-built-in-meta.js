'use strict';

const _ = require('lodash');

// These are _normalized_ versions of the built-in meta attributes. Therefore,
// they must be spelled out explicitly, rather than using short-hand notation.
const builtInMeta = {
  created_at: {
    type: 'TIMESTAMPTZ',
    nullable: false,
    default: 'CURRENT_TIMESTAMP'
  },
  updated_at: {
    type: 'TIMESTAMPTZ',
    nullable: false,
    default: null
  }
};

module.exports = function(builtInMetaAttributes) {
  const meta = {};
  _.forEach(builtInMetaAttributes, (include, metaName) => {
    if (include) {
      meta[metaName] = builtInMeta[metaName];
    }
  });
  return meta;
};
