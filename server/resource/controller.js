'use strict';

const _ = require('lodash');
const pgp = require('pg-promise');
const log = require('../util/log');
const db = require('../util/db');
const baseSql = require('../util/base-sql');
const serverErrors = require('../util/server-errors');
const mapPgError = require('../util/map-pg-error');

// This is the function called when a query fails.
function handleQueryError(res, err) {
  var serverError;

  // First, check to see if it's a pgp QueryResultError. If it
  // is, we generate the appropriate server error.
  if (err instanceof pgp.errors.QueryResultError) {
    serverError = mapPgError(err.code);
  }

  // If it's not a pgp QueryResultError, we send over tbe generic server error.
  else {
    log.warn({err}, 'There was an unknown server error.');
    serverError = serverErrors.generic;
  }

  res.status(serverError.code).send({
    errors: [serverError.body()]
  });
}

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
    const id = req.params.id;

    // `isSingular` is whether or not we're looking for 1
    // or all. This coercion is fine because SERIALs start at 1
    const isSingular = Boolean(id);
    const query = baseSql.read(this.table, '*', {isSingular});
    const method = isSingular ? 'one' : 'any';

    db[method](query, {id})
      .then(result => {
        var formattedResult;
        if (!Array.isArray(result)) {
          formattedResult = formatTransaction(result);
        } else {
          formattedResult = _.map(result, formatTransaction);
        }
        res.send({
          data: formattedResult
        });
      })
      .catch(_.partial(handleQueryError, res));
  },

  update(req, res) {
    console.log('wat', _.pick(req, ['body', 'params']));

    log.info({reqId: req.id}, `Updated a ${this.table}`);
    res.send([1, 2, 3]);
  },

  delete(req, res) {
    log.info({reqId: req.id}, `Deleted a ${this.table}`);
    res.status(204).end();
  }
});

module.exports = Controller;
