'use strict';

const _ = require('lodash');
const create = require('./middleware/create');
const read = require('./middleware/read');
const update = require('./middleware/update');
const del = require('./middleware/delete');

// The Controller interfaces with the database. It performs our CRUD operations.
// Access to the controller occurs through the routes.
function Controller({definition, version, db}) {
  this.definition = definition;
  this.db = db;
  this.version = version;
  _.bindAll(this, ['create', 'read', 'update', 'del']);
}

Object.assign(Controller.prototype, {create, read, update, del});

module.exports = Controller;
