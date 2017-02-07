'use strict';

const _ = require('lodash');
const normalizeFields = require('./util/normalize-fields');
const normalizeRelations = require('./util/normalize-relations');
const normalizeBuiltInMeta = require('./util/normalize-built-in-meta');

const resourceProps = [
  'name', 'plural_form', 'attributes', 'meta', 'relations', 'actions'
];

// Resource Models written by hand are allowed to be incomplete; for instance,
// if you're OK with accepting a default value.
// This takes an incomplete resource model, and outputs a complete version of
// it.
module.exports = function(resourceModel) {
  const resource = _.merge(
    {
      // "book" => "books"
      plural_form: `${resourceModel.name}s`,
      attributes: {},
      meta: {},
      relations: {},
      actions: {
        create: true,
        readOne: true,
        readMany: true,
        update: true,
        delete: true
      },
      // Set the default built-in-meta
      built_in_meta_attributes: {
        created_at: true,
        updated_at: true
      }
    },
    resourceModel
  );

  resource.attributes = normalizeFields(resource.attributes);
  resource.relations = normalizeRelations(resource.relations);

  // Combine the built in meta with any user-defined meta
  const builtInMeta = normalizeBuiltInMeta(resource.built_in_meta_attributes);
  const userDefinedMeta = normalizeFields(resource.meta);
  resource.meta = Object.assign(builtInMeta, userDefinedMeta);

  return _.pick(resource, resourceProps);
};
