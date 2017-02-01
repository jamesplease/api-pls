'use strict';

const _ = require('lodash');
const pgp = require('pg-promise');
const db = require('../util/db');
const log = require('../util/log');

// A controller represents an interface to the data
// stored in our database. Eventually, this might be
// turned into a separate library, rather than part of this
// app specifically
function Controller({table}) {
  this.table = table;
  _.bindAll(this, ['create', 'read', 'update', 'delete']);
}

Object.assign(Controller.prototype, {
  create(req, res) {
    res.status(201).send({
      data: {created: true}
    });
  },

  read(req, res) {
    res.send({
      data: {hungry: true}
    });
  },

  update(req, res) {
    res.send([1, 2, 3]);
  },

  delete(req, res) {
    res.status(204).end();
  }
});

module.exports = Controller;
