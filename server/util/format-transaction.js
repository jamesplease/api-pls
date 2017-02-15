'use strict';

const _ = require('lodash');
const buildResponseRelationships = require('./build-response-relationships');

// This transforms the data from the format that it is in the
// database to the one we need for our endpoint.
// This would one day have things like supporting more types from the ORM
// layer. For now it's pretty basic.
module.exports = function(t, resource, version) {
  const attrs = ([]).concat(Object.keys(resource.attributes));
  // Meta values in the table are prefixed with `meta`, so we add that to the
  // meta names in the Resource Model for comparison.
  const meta = ([])
    .concat(Object.keys(resource.meta))
    .map(m => `meta_${m}`);
  const relationships = buildResponseRelationships(t, resource, version);

  const pickedAttrs = _.pick(t, attrs);
  // Remove the meta prefix for sending back to the user.
  const pickedMeta = _.chain(t)
    .pick(meta)
    .mapKeys((m, k) => k.substring(5))
    .value();

  const response = {
    id: String(t.id),
    type: resource.plural_form,
  };

  if (_.size(pickedAttrs)) {
    response.attributes = pickedAttrs;
  }
  if (_.size(pickedMeta)) {
    response.meta = pickedMeta;
  }
  if (_.size(relationships)) {
    response.relationships = relationships;
  }

  return response;
};
