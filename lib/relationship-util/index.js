'use strict';

// These are the valid relationship cardinalities, or "types". The values of
// this object are what should be used in a resource model or definition.
exports.cardinality = {
  manyToMany: 'many-to-many',
  oneToOne: 'one-to-one',
  manyToOne: 'many-to-one',
  oneToMany: 'one-to-many'
};

// `true` if the relationship could have many related entities. `false` if it's
// just one.
exports.isToMany = function(type) {
  return type === exports.cardinality.manyToMany || type === exports.cardinality.oneToMany;
};

// `true` if the relationship is stored in a host resource table.
exports.isStoredInHostTable = function(type) {
  return type !== exports.cardinality.manyToMany;
};

// `true` if the relationship is stored on an associative table
exports.isStoredInAssociativeTable = function(type) {
  return !exports.isHostedRelationship(type);
};

// Gets the inverse of a relationshipType.
// "many-to-one" => "one-to-many"
// "one-to-one" => "one-to-one"
exports.inverse = function(relationshipType) {
  if (relationshipType === exports.cardinality.manyToOne) {
    return exports.cardinality.oneToMany;
  } else if (relationshipType === exports.cardinality.oneToMany) {
    return exports.cardinality.manyToOne;
  } else {
    return relationshipType;
  }
};
