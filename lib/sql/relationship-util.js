'use strict';

exports.types = {
  manyToMany: 'many-to-many',
  oneToOne: 'one-to-one',
  manyToOne: 'many-to-one',
  oneToMany: 'one-to-many'
};

// `true` if the relationship could have many related entities. `false` if it's
// just one.
exports.isToMany = function(type) {
  return type === exports.types.manyToMany || type === exports.types.oneToMany;
};

// `true` if the relationship is stored in a host resource table.
exports.isStoredInHostTable = function(type) {
  return type !== exports.types.manyToMany;
};

// `true` if the relationship is stored on an associative table
exports.isStoredInAssociativeTable = function(type) {
  return !exports.isHostedRelationship(type);
};
