'use strict';

// These are _normalized_ versions of the built-in meta attributes. Therefore,
// they are spelled out explicitly, rather than using short-hand notation.
module.exports = {
  created_at: {
    type: 'TIMESTAMPTZ',
    nullable: false,
    default: 'CURRENT_TIMESTAMP'
  },
  updated_at: {
    type: 'TIMESTAMPTZ',
    nullable: true,
    default: null
  }
};
