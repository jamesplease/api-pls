'use strict';

const _ = require('lodash');
const log = require('../../util/log');
const baseSql = require('../../util/base-sql');
const serverErrors = require('../../util/server-errors');
const sendJson = require('../../util/send-json');
const handleQueryError = require('../../util/handle-query-error');
const formatTransaction = require('../../util/format-transaction');

module.exports = function(req, res) {
  log.info({req}, 'A create request is being processed.');
  const selfLinkBase = req.path;
  const data = _.get(req, 'body.data', {});
  const rawAttrs = data.attributes;
  const rawMeta = data.meta;
  const rawRelations = data.relationships;

  const attrs = _.pick(rawAttrs, this.definition.attributeNames);
  // At the moment, this allows users to modify the built-in-meta, which is
  // no good.
  const meta = _.pick(rawMeta, this.definition.metaNames);
  const relations = _.pick(rawRelations, this.definition.relationshipNames);

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
      errors: [serverErrors.noValidFields.body(this.definition.plural_form)],
      links: {
        self: selfLinkBase
      }
    });
    return;
  }

  const query = baseSql.create({
    tableName: this.definition.name,
    db: this.db,
    attrs: columns
  });

  log.info({query, definition: this.definition, reqId: req.id}, 'Creating a resource');

  this.db.one(query)
    .then(result => {
      const createdLink = `${selfLinkBase}/${result.id}`;
      log.info({reqId: req.id}, 'Resource created.');
      res
        .status(201)
        .header('Location', createdLink);
      sendJson(res, {
        data: formatTransaction(result, this.definition, this.version),
        links: {
          self: createdLink
        }
      });
    })
    .catch(err => handleQueryError({
      definition: this.definition,
      selfLink: selfLinkBase,
      crudAction: 'create',
      err, req, res, query
    }));
};
