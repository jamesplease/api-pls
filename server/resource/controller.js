'use strict';

const _ = require('lodash');
const create = require('./middleware/create');
const read = require('./middleware/read');
const update = require('./middleware/update');

// The Controller interfaces with the database. It performs our CRUD operations.
// Access to the controller occurs through the routes.
function Controller({definition, version, db}) {
  this.definition = definition;
  this.db = db;
  this.version = version;
  _.bindAll(this, ['create', 'read', 'update']);
}

Object.assign(Controller.prototype, {create, read, update});

module.exports = Controller;
