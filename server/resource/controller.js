'use strict';

const _ = require('lodash');
const pgp = require('pg-promise');
const log = require('../util/log');
const baseSql = require('../util/base-sql');
const serverErrors = require('../util/server-errors');
const mapPgError = require('../util/map-pg-error');
const sendJson = require('../util/send-json');

// This is the function called when a query fails.
function handleQueryError(err, res, resource, crudAction, query) {
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
    err, crudAction, query
  }, 'There was a query error with a CRUD request.');
  res.status(serverError.code);
  sendJson(res, {
    errors: [serverError.body()]
  });
}

// The Controller interfaces with the database. It performs our CRUD operations.
// Access to the controller occurs through the routes.
function Controller(resource, db) {
  this.resource = resource;
  this.tableName = resource.name;
  this.db = db;

  _.bindAll(this, ['create', 'read', 'update', 'delete', 'formatTransaction']);
}

Object.assign(Controller.prototype, {
  // This transforms the data from the format that it is in the
  // database to the one we need for our endpoint.
  // This would one day have things like supporting more types from the ORM
  // layer. For now it's pretty basic.
  formatTransaction(t) {
    const attrs = ([]).concat(Object.keys(this.resource.attributes));

    return {
      id: t.id,
      type: this.resource.plural_form,
      attributes: _.pick(t, attrs)
    };
  },

  create(req, res) {
    const rawAttrs = _.get(req, 'body.attributes', {});
    const attrs = _.pick(rawAttrs, Object.keys(this.resource.attributes));

    const query = baseSql.create({
      tableName: this.tableName,
      db: this.db,
      attrs
    });

    log.info({query, resource: this.resource}, 'Creating a resource');

    this.db.one(query)
      .then(result => {
        log.info({query, resource: this.resource}, 'Resource created.');
        res.status(201);
        sendJson(res, {
          data: this.formatTransaction(result)
        });
      })
      .catch(err => handleQueryError(err, res, this.resource, 'create', query));
  },

  read(req, res) {
    const id = req.params.id;

    // `isSingular` is whether or not we're looking for 1
    // or all. This coercion is fine because SERIALs start at 1
    const isSingular = Boolean(id);
    const query = baseSql.read({
      tableName: this.tableName,
      db: this.db,
      fields: '*',
      id
    });
    const method = isSingular ? 'one' : 'any';

    log.info({query, resourceName: this.resource.name}, 'Reading a resource');

    this.db[method](query)
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
        handleQueryError(err, res, this.resource, crudAction, query);
      });
  },

  update(req, res) {
    const id = req.params.id;
    const rawAttrs = _.get(req, 'body.attributes', {});
    const attrs = _.pick(rawAttrs, Object.keys(this.resource.attributes));

    let query;

    // If there's nothing to update, we can use a read query.
    if (!_.size(attrs)) {
      query = baseSql.read({
        tableName: this.tableName,
        db: this.db,
        fields: '*',
        id
      });
    }

    // Otherwise, we get the update query.
    else {
      query = baseSql.update({
        tableName: this.tableName,
        db: this.db,
        attrs, id
      });
    }

    log.info({query, resource: this.resource}, 'Updating a resource');

    this.db.one(query)
      .then(result => {
        log.info({query, resource: this.resource}, 'Updated a resource');
        sendJson(res, {
          data: this.formatTransaction(result)
        });
      })
      .catch(err => handleQueryError(err, res, this.resource, 'update', query));
  },

  delete(req, res) {
    const query = baseSql.delete({
      tableName: this.tableName,
      db: this.db,
      id: req.params.id
    });

    log.info({query, resourceName: this.resource.name}, 'Deleting a resource');

    this.db.one(query)
      .then(() => {
        log.info({query, resourceName: this.resource.name}, 'Deleted a resource');
        res.status(204).end();
      })
      .catch(err => handleQueryError(err, res, this.resource, 'delete', query));
  }
});

module.exports = Controller;
