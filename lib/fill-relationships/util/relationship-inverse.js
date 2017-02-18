'use strict';

// Gets the inverse of a relationshipType.
// "many-to-one" => "one-to-many"
// "one-to-one" => "one-to-one"
module.exports = function(relationshipType) {
  if (relationshipType === 'many-to-one') {
    return 'one-to-many';
  } else if (relationshipType === 'one-to-many') {
    return 'many-to-one';
  } else {
    return relationshipType;
  }
};
