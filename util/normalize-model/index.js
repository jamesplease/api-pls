'use strict';

const _ = require('lodash');
const normalizeAttributes = require('./util/normalize-attributes');

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
      // All resources get these unless they opt out of them
      built_in_attributes: {
        created_at: true,
        updated_at: true
      }
    },
    resourceModel
  );

  resource.attributes = normalizeAttributes(resource.attributes);

  return resource;
};
