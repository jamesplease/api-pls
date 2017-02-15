'use strict';

const _ = require('lodash');
const log = require('../../util/log');
const baseSql = require('../../util/base-sql');
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

  const attrs = _.pick(rawAttrs, Object.keys(this.resource.attributes));
  // At the moment, this allows users to modify the built-in-meta, which is
  // no good.
  const meta = _.chain(rawMeta)
    .pick(Object.keys(this.resource.meta))
    .mapKeys((v, k) => `meta_${k}`)
    .value();
  const relations = _.pick(rawRelations, Object.keys(this.resource.relationships));

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
    query = baseSql.read({
      tableName: this.resource.name,
      db: this.db,
      fields: '*',
      id
    });
  }

  // Otherwise, we get the update query.
  else {
    query = baseSql.update({
      tableName: this.resource.name,
      db: this.db,
      attrs: columns,
      id
    });
  }

  log.info({query, resource: this.resource, reqId: req.id}, 'Updating a resource');

  this.db.one(query)
    .then(result => {
      log.info({query, resource: this.resource, reqId: req.id}, 'Updated a resource');
      sendJson(res, {
        data: formatTransaction(result, this.resource, this.version),
        links: {
          self: selfLink
        }
      });
    })
    .catch(err => handleQueryError({err, req, res, resource: this.resource, crudAction: 'update', query, selfLink}));
};
