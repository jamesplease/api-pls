'use strict';

const _ = require('lodash');
const handleQueryError = require('../util/handle-query-error');
const formatTransaction = require('../util/format-transaction');
const crud = require('../sql/crud');
const serverErrors = require('../../api-pls-utils/server-errors');

module.exports = async function(req) {
  const pls = req.pls;

  pls.log.info({req}, 'A create request is being processed.');
  const selfLinkBase = req.path;
  const data = _.get(req, 'body.data', {});
  const rawAttrs = data.attributes;
  const rawMeta = data.meta;
  const rawRelations = data.relationships;

  const attrs = _.pick(rawAttrs, pls.definition.attributeNames);
  const meta = _.pick(rawMeta, pls.definition.metaNames);
  const relations = _.pick(rawRelations, pls.definition.relationshipNames);

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
    pls.log.info({reqId: req.id}, 'A create request had no columns to update');
    return {
      code: serverErrors.noValidFields.code,
      body: {
        errors: [serverErrors.noValidFields.body(pls.definition.plural_form)],
        links: {
          self: selfLinkBase
        }
      }
    };
  }

  const query = crud.create({
    tableName: pls.definition.name,
    db: pls.adapter.db,
    attrs: columns
  });

  pls.log.info({query, definition: pls.definition, reqId: req.id}, 'Creating a resource');

  const result = await pls.adapter.db.tx(t => {
    const primaryTableQuery = t.one(query);
    return t.batch([primaryTableQuery]);
  }).catch(r => r);

  if (result instanceof Error) {
    return handleQueryError({
      err: result,
      definition: pls.definition,
      selfLink: selfLinkBase,
      crudAction: 'create',
      req, query
    });
  }

  const primaryTableResult = result[0];
  const createdLink = `${selfLinkBase}/${primaryTableResult.id}`;
  pls.log.info({reqId: req.id}, 'Resource created.');

  return {
    code: 201,
    headers: {
      Location: createdLink
    },
    body: {
      data: formatTransaction(primaryTableResult, pls.definition, pls.version, pls.adjustResourceQuantity),
      links: {
        self: createdLink
      }
    }
  };
};
