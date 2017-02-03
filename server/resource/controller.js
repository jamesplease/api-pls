'use strict';

const _ = require('lodash');
const pgp = require('pg-promise');
const log = require('../util/log');
const db = require('../util/db');
const baseSql = require('../util/base-sql');
const serverErrors = require('../util/server-errors');
const mapPgError = require('../util/map-pg-error');
const sendJson = require('../util/send-json');

// This is the function called when a query fails.
function handleQueryError(err, res, resource, crudAction) {
  var serverError;

  // First, check to see if it's a pgp QueryResultError. If it
  // is, we generate the appropriate server error.
  if (err instanceof pgp.errors.QueryResultError) {
    serverError = mapPgError(err.code);
  }

  // If it's not a pgp QueryResultError, we send over tbe generic server error.
  else {
    serverError = serverErrors.generic;
  }

  log.warn({
    resourceName: resource.name,
    err, crudAction
  }, 'There was a query error with a CRUD request.');
  res.status(serverError.code);
  sendJson(res, {
    errors: [serverError.body()]
  });
}

// The Controller interfaces with the database. It performs our CRUD operations.
// Access to the controller occurs through the routes.
function Controller(resource) {
  this.resource = resource;
  this.table = resource.name;

  _.bindAll(this, ['create', 'read', 'update', 'delete', 'formatTransaction']);
}

Object.assign(Controller.prototype, {
  // This transforms the data from the format that it is in the
  // database to the one we need for our endpoint.
  // This would one day have things like supporting more types from the ORM
  // layer. For now it's pretty basic.
  formatTransaction(t) {
    const attrs = ([]).concat(this.resource.attributes);

    return {
      id: t.id,
      type: this.resource.plural_form,
      attributes: _.pick(t, attrs)
    };
  },

  create(req, res) {
    const attrs = _.get(req, 'body.attributes', {});
    const body = _.pick(attrs, this.resource.attributes);

    const fields = Object.keys(body);
    const query = baseSql.create(this.table, fields);

    log.info({query, resourceName: this.resource.name}, 'Creating a resource');

    db.one(query, body)
      .then(result => {
        log.info({query, resourceName: this.resource.name}, 'Resource created.');
        res.status(201);
        sendJson(res, {
          data: this.formatTransaction(result)
        });
      })
      .catch(err => handleQueryError(err, res, this.resource, 'create'));
  },

  read(req, res) {
    const id = req.params.id;

    // `isSingular` is whether or not we're looking for 1
    // or all. This coercion is fine because SERIALs start at 1
    const isSingular = Boolean(id);
    const query = baseSql.read(this.table, '*', {isSingular});
    const method = isSingular ? 'one' : 'any';

    log.info({query, resourceName: this.resource.name}, 'Reading a resource');

    db[method](query, {id})
      .then(result => {
        var formattedResult;
        if (!Array.isArray(result)) {
          formattedResult = this.formatTransaction(result);
        } else {
          formattedResult = _.map(result, this.formatTransaction);
        }
        log.info({query, resourceName: this.resource.name}, 'Read a resource');
        sendJson(res, {
          data: formattedResult
        });
      })
      .catch(err => {
        const crudAction = isSingular ? 'readOne' : 'readMany';
        handleQueryError(err, res, this.resource, crudAction);
      });
  },

  update(req, res) {
    const id = req.params.id;
    const attrs = _.get(req, 'body.attributes', {});
    const body = _.pick(attrs, this.resource.attributes);

    const fields = Object.keys(body);

    let query;

    // If there's nothing to update, we can use a read query
    if (!fields.length) {
      query = baseSql.read(this.table, '*', {singular: true});
    }

    // Otherwise, we get the update query.
    else {
      query = baseSql.update(this.table, fields);
    }

    const queryData = Object.assign({id}, body);

    log.info({query, resourceName: this.resource.name}, 'Updating a resource');

    db.one(query, queryData)
      .then(result => {
        log.info({query, resourceName: this.resource.name}, 'Updated a resource');
        sendJson(res, {
          data: this.formatTransaction(result)
        });
      })
      .catch(err => handleQueryError(err, res, this.resource, 'update'));
  },

  delete(req, res) {
    const id = req.params.id;
    const query = baseSql.delete(this.table);

    log.info({query, resourceName: this.resource.name}, 'Deleting a resource');

    db.one(query, {id})
      .then(() => {
        log.info({query, resourceName: this.resource.name}, 'Deleted a resource');
        res.status(204).end();
      })
      .catch(err => handleQueryError(err, res, this.resource, 'delete'));
  }
});

module.exports = Controller;
