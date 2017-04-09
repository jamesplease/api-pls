'use strict';

const _ = require('lodash');
const Graph = require('dependency-graph').DepGraph;

// Resources can have dependencies on one another, due to their relationships.
// This module accepts an array of resource models, and will return a list of
// resource names in the correct order. This can then be used to migrate
// them in the correct order.
module.exports = function(resources) {
  const graph = new Graph();

  // First, add all of the nodes to the graph.
  _.forEach(resources, r => graph.addNode(r.name));

  // Then, loop through to set their dependencies on one another.
  _.forEach(resources, resource => {
    const relationships = _.chain(resource.relationships)
      // It is the host of the relationship that has a dependency on the other
      // resource
      .filter(relation => relation.host)
      .map(relation => relation.resource)
      // Self-referential dependencies are no problem for Postgres, but they
      // are for `dependency-graph`, so we filter those out in this algorithm.
      .filter(resourceName => resourceName !== resource.name)
      .value();

    _.forEach(relationships, r => graph.addDependency(resource.name, r));
  });

  // Return them in order
  const order = graph.overallOrder();
  return _.map(order, rName => _.find(resources, r => r.name === rName));
};
