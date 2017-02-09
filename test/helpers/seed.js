'use strict';

const getDb = require('../../lib/database');
const db = getDb();

const insert = db.$config.pgp.helpers.insert;

// `resource`: The singular name of the resource to seed
// `seeds`: An array of seeds to insert
module.exports = function(resource, seeds) {
  const columns = Object.keys(seeds[0]);
  const query = insert(seeds, columns, resource);
  return db.query(query);
}
