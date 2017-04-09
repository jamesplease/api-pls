'use strict';

const _ = require('lodash');
const read = require('./middleware/read');

// The Controller interfaces with the database. It performs our CRUD operations.
// Access to the controller occurs through the routes.
function Controller({definition, version, db}) {
  this.definition = definition;
  this.db = db;
  this.version = version;
  _.bindAll(this, ['read']);
}

Object.assign(Controller.prototype, {read});

module.exports = Controller;
