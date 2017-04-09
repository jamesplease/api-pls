'use strict';

const _ = require('lodash');
const crud = require('../sql/crud');
const handleQueryError = require('../util/handle-query-error');
const formatTransaction = require('../util/format-transaction');

module.exports = async function(req) {
  const pls = req.pls;

  pls.log.info({req}, 'An update request is being processed.');
  const selfLink = req.path;
  const id = req.params.id;
  const rawAttrs = _.get(req, 'body.data.attributes', {});
  const rawMeta = _.get(req, 'body.data.meta', {});
  const rawRelations = _.get(req, 'body.data.relationships', {});

  const attrs = _.pick(rawAttrs, pls.definition.attributeNames);
  // At the moment, this allows users to modify the built-in-meta, which is
  // no good.
  const meta = _.pick(rawMeta, pls.definition.metaNames);
  const relations = _.pick(rawRelations, pls.definition.relationshipNames);

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
      definition: pls.definition,
      db: pls.adapter.db,
      id
    });
  }

  // Otherwise, we get the update query.
  else {
    query = crud.update({
      tableName: pls.definition.tableName.raw,
      db: pls.adapter.db,
      attrs: columns,
      id
    });
  }

  pls.log.info({query, definition: pls.definition, reqId: req.id}, 'Updating a resource');

  const result = await pls.adapter.db.tx(t => {
    const primaryTableQuery = t.one(query);
    return t.batch([primaryTableQuery]);
  }).catch(r => r);

  if (_.isError(result)) {
    return handleQueryError({
      err: result,
      definition: pls.definition,
      crudAction: 'update',
      req, query, selfLink
    });
  }

  const primaryTableUpdate = result[0];
  pls.log.info({query, definition: pls.definition, reqId: req.id}, 'Updated a resource');

  return {
    body: {
      data: formatTransaction(primaryTableUpdate, pls.definition, pls.version, pls.adjustResourceQuantity),
      links: {
        self: selfLink
      }
    }
  };
};
