'use strict';

const express = require('express');
const routeBuilder = require('express-routebuilder');
const Resource = require('./resource');
const serverErrors = require('./util/server-errors');
const loadResourceModels = require('../util/load-resource-models');
const buildJsonSchema = require('../util/build-json-schema');
const sendJson = require('./util/send-json');
const jsonApiHeaders = require('./util/json-api-headers');
const createDb = require('../database');
const adjustResourceQuantity = require('./util/adjust-resource-quantity');

module.exports = function(options) {
  const router = express.Router();
  router.use(jsonApiHeaders);

  const db = createDb(options);

  // This version needs to be made external
  var apiVersion = 1;

  var definitions = loadResourceModels(options.resourcesDirectory)
    .map(resourceModel => {
      return Object.assign(resourceModel, {
        validations: buildJsonSchema(resourceModel)
      });
    });

  adjustResourceQuantity.setResources(definitions);

  var resources = definitions.map(resource => new Resource({
    version: apiVersion,
    resource,
    db
  }));

  // Configure routes for our resources.
  resources.forEach(resource =>
    router.use(routeBuilder(
      express.Router(),
      resource.routes,
      resource.location
    ))
  );

  router.get('/', (req, res) => res.redirect(`/v${apiVersion}`));

  // Set up the root route that describes the available endpoints.
  router.get(`/v${apiVersion}`, (req, res) => {
    sendJson(res, {
      version: `v${apiVersion}`,
      endpoints: resources.map(resource => {
        return {
          route: resource.location,
          methods: Object.keys(resource.routes)
        };
      })
    });
  });

  // All other requests get a default 404 error.
  router.get('*', (req, res) => {
    res.status(404);
    sendJson(res, {
      errors: [serverErrors.notFound.body()]
    });
  });

  return router;
};
