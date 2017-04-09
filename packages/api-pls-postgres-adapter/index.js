'use strict';

const create = require('./middleware/create');
const read = require('./middleware/read');
const update = require('./middleware/update');
const del = require('./middleware/delete');
const createDb = require('../../lib/database');

function Adapter(options) {
  const db = createDb(options);

  return {
    crud: {create, read, update, del},
    db
  };
}

module.exports = Adapter;
