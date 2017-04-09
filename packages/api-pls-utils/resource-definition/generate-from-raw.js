'use strict';

const normalizeModel = require('../resource-model/normalize');
const fillRelationships = require('../resource-model/fill-relationships');
const generate = require('./generate');

module.exports = function(rawResourceModels) {
  const resources = rawResourceModels
    .map(normalizeModel);

  const filledResources = fillRelationships(resources);
  const definitions = generate(filledResources);

  return definitions;
};
