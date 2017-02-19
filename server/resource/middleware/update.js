'use strict';

const _ = require('lodash');
const log = require('../../util/log');
const crud = require('../../../lib/sql/crud');
const sendJson = require('../../util/send-json');
const handleQueryError = require('../../util/handle-query-error');
const formatTransaction = require('../../util/format-transaction');

module.exports = function(req, res) {
  log.info({req}, 'An update request is being processed.');
  const selfLink = req.path;
  const id = req.params.id;
  const rawAttrs = _.get(req, 'body.data.attributes', {});
  const rawMeta = _.get(req, 'body.data.meta', {});
  const rawRelations = _.get(req, 'body.data.relationships', {});

  const attrs = _.pick(rawAttrs, this.definition.attributeNames);
  // At the moment, this allows users to modify the built-in-meta, which is
  // no good.
  const meta = _.pick(rawMeta, this.definition.metaNames);
  const relations = _.pick(rawRelations, this.definition.relationshipNames);

  // This maps the name that the user passes in to the ID that they pass in.
  // A chain().mapValue().mapKeys() could probably do this in a cleaner
  // manner.
  const relData = _.reduce(Object.keys(relations), (result, field) => {
    result[`${field}_id`] = _.get(relations[field], 'data.id');
    return result;
  }, {});

  const columns = Object.assign(attrs, meta, relData);

  let query;

  // If there's nothing to update, we can use a read query.
  if (!_.size(columns)) {
    query = crud.read({
      definition: this.definition,
      db: this.db,
      fields: '*',
      id
    });
  }

  // Otherwise, we get the update query.
  else {
    query = crud.update({
      tableName: this.definition.tableName.raw,
      db: this.db,
      attrs: columns,
      id
    });
  }

  log.info({query, definition: this.definition, reqId: req.id}, 'Updating a resource');

  this.db.one(query)
    .then(result => {
      log.info({query, definition: this.definition, reqId: req.id}, 'Updated a resource');
      sendJson(res, {
        data: formatTransaction(result, this.definition, this.version),
        links: {
          self: selfLink
        }
      });
    })
    .catch(err => handleQueryError({err, req, res, definition: this.definition, crudAction: 'update', query, selfLink}));
};
