'use strict';

const _ = require('lodash');
const buildResponseRelationships = require('./build-response-relationships');

// This transforms the data from the format that it is in the
// database to the one we need for our endpoint.
// This would one day have things like supporting more types from the ORM
// layer. For now it's pretty basic.
module.exports = function(t, definition, version) {
  const attrs = ([]).concat(_.map(definition.attributes, 'name'));
  const meta = ([]).concat(_.map(definition.meta, 'name'));
  const relationships = buildResponseRelationships(t, definition, version);

  const pickedAttrs = _.pick(t, attrs);
  const pickedMeta = _.pick(t, meta);

  const response = {
    id: String(t.id),
    type: definition.plural_form,
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
