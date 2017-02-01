'use strict';

const _ = require('lodash');
const log = require('../util/log');

// The Controller interfaces with the database. It performs our CRUD operations.
// Access to the controller occurs through the routes.
function Controller({table}) {
  this.table = table;
  _.bindAll(this, ['create', 'read', 'update', 'delete']);
}

Object.assign(Controller.prototype, {
  create(req, res) {
    log.info({reqId: req.id}, `Created a ${this.table}`);
    res.status(201).send({
      data: {created: true}
    });
  },

  read(req, res) {
    log.info({reqId: req.id}, `Retrieved a ${this.table}`);
    res.send({
      data: {hungry: true}
    });
  },

  update(req, res) {
    log.info({reqId: req.id}, `Updated a ${this.table}`);
    res.send([1, 2, 3]);
  },

  delete(req, res) {
    log.info({reqId: req.id}, `Deleted a ${this.table}`);
    res.status(204).end();
  }
});

module.exports = Controller;
