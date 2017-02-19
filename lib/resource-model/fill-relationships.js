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
      return r.resource === resource.name && r.cardinality === inverseCardinality;
    });

    // Add in the relationship if it does not exist
    if (!inverseExists) {
      // Ensure that the relationship array exists.
      related.relationships = related.relationships ? related.relationships : {};
      // Push the new relationship to the array
      related.relationships[resource.name] = {
        resource: resource.name,
        cardinality: inverseCardinality,
        host: false,
        nullable: true
      };
    } else {
      // This just overrides whatever the use put in.
      inverseExists.resource = resource.name;
      inverseExists.cardinality = inverseCardinality;
      inverseExists.host = false;

      // I need to look into whether the user really has much control over
      // the nullability of guest relationships
      if (!_.isUndefined(inverseExists.nullable)) {
        inverseExists.nullable = Boolean(inverseExists.nullable);
      } else {
        inverseExists.nullable = true;
      }
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
