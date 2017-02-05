'use strict';

const express = require('express');
const routeBuilder = require('express-routebuilder');
const Resource = require('./resource');
const serverErrors = require('./util/server-errors');
const loadResourceModels = require('api-pls-util/load-resource-models');
const buildJsonSchema = require('api-pls-util/build-json-schema');
const sendJson = require('./util/send-json');
const jsonApiHeaders = require('./util/json-api-headers');

module.exports = function(options) {
  const router = express.Router();
  router.use(jsonApiHeaders);

  // This version needs to be made external
  var apiVersion = 1;

  var definitions = loadResourceModels(options.resourcesDirectory)
    .map(resourceModel => {
      return Object.assign(resourceModel, {
        validations: buildJsonSchema(resourceModel)
      });
    });

  var resources = definitions.map(resource => new Resource({
    version: apiVersion,
    resource,
    options
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
