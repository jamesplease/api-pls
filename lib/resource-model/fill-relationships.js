'use strict';

const _ = require('lodash');
const relationshipUtil = require('../relationship-util');

function setNonHosts(resource, key, resources) {
  const relationships = resource.relationships;
  _.each(relationships, relation => {
    // We only need to worry about hosts.
    if (!relation.host) {
      return;
    }

    // Find the resource that is referenced by this relationship
    const related = _.find(resources, {name: relation.resource});

    // The related resource would have the inverse relationship specified, if
    // at all.
    const inverseCardinality = relationshipUtil.inverse(relation.cardinality);
    const inverseExists = _.find(related.relationships, r => {
      return r.resource === resource.name && r.relationship === inverseCardinality;
    });

    // Add in the relationship if it does not exist
    if (!inverseExists) {
      related.relationships[resource.name] = {
        resource: resource.name,
        cardinality: inverseCardinality,
        host: false,
        nullable: true
      };
    }
  });
}

// This ensures that non-hosts of relationships also have their "relationships"
// property set. This is used to power the API's two-way support for
// relationships.
module.exports = function(resources) {
  const newResources = _.cloneDeep(resources);
  _.each(newResources, setNonHosts);
  return newResources;
};
