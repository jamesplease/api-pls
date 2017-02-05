'use strict';

// This is useful for checking that the ID is an integer or numeric string.
// One day, we will need to support other types of IDs, but this is the default
// ID that is given out of the box.
module.exports = {
  anyOf: [
    {type: 'integer'},
    {
      type: 'string',
      pattern: '^[0-9]+$'
    }
  ],
  required: true
};
