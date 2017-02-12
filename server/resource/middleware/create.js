'use strict';

const _ = require('lodash');
const log = require('../../util/log');
const baseSql = require('../../util/base-sql');
const serverErrors = require('../../util/server-errors');
const sendJson = require('../../util/send-json');
const handleQueryError = require('../../util/handle-query-error');
const formatTransaction = require('../../util/format-transaction');

module.exports = function(req, res) {
  log.info({req, res}, 'A create request is being processed.');
  const selfLinkBase = req.path;
  const data = _.get(req, 'body.data', {});
  const rawAttrs = data.attributes;
  const rawMeta = data.meta;
  const rawRelations = data.relationships;

  const attrs = _.pick(rawAttrs, Object.keys(this.resource.attributes));
  // At the moment, this allows users to modify the built-in-meta, which is
  // no good.
  const meta = _.pick(rawMeta, Object.keys(this.resource.meta));
  const relations = _.pick(rawRelations, Object.keys(this.resource.relationships));

  // This maps the name that the user passes in to the ID that they pass in.
  // A chain().mapValue().mapKeys() could probably do this in a cleaner
  // manner.
  const relData = _.reduce(Object.keys(relations), (result, field) => {
    // Determine if the user has specified a value for this relationship
    const possibleRelation = _.get(relations[field], 'data.id');
    // If they have, then we will add it to the object that will be used to
    // build our query
    if (possibleRelation) {
      result[`${field}_id`] = possibleRelation;
    }
    return result;
  }, {});

  const columns = Object.assign(attrs, meta, relData);

  if (!_.size(columns)) {
    log.info({reqId: req.id}, 'A create request had no columns to update');
    res.status(serverErrors.noValidFields.code);
    sendJson(res, {
      errors: [serverErrors.noValidFields.body(this.resource.plural_form)],
      links: {
        self: selfLinkBase
      }
    });
    return;
  }

  const query = baseSql.create({
    tableName: this.resource.name,
    db: this.db,
    attrs: columns
  });

  log.info({query, resource: this.resource, reqId: req.id}, 'Creating a resource');

  this.db.one(query)
    .then(result => {
      log.info({reqId: req.id}, 'Resource created.');
      res.status(201);
      sendJson(res, {
        data: formatTransaction(result, this.resource, this.version),
        links: {
          self: `${selfLinkBase}/${result.id}`
        }
      });
    })
    .catch(err => handleQueryError({
      resource: this.resource,
      selfLink: selfLinkBase,
      crudAction: 'create',
      err, req, res, query
    }));
};
