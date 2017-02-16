'use strict';

const _ = require('lodash');
const express = require('express');
const routeBuilder = require('express-routebuilder');
const Resource = require('./resource');
const serverErrors = require('./util/server-errors');
const loadResourceModels = require('../lib/load-resource-models');
const normalizeModel = require('../lib/normalize-model');
const buildJsonSchema = require('../lib/build-json-schema');
const fillRelationships = require('../lib/fill-relationships');
const sendJson = require('./util/send-json');
const jsonApiHeaders = require('./util/json-api-headers');
const createDb = require('../lib/database');
const adjustResourceQuantity = require('./util/adjust-resource-quantity');
const log = require('./util/log');

module.exports = function(options) {
  const router = express.Router();
  router.use(jsonApiHeaders);

  const db = createDb(options);
  const apiVersion = options.apiVersion;

  log.info({
    resourcesDirectory: options.resourcesDirectory
  }, 'Loading resources from the resources directory.');

  // Load and normalize our models.
  var normalizedModels = loadResourceModels(options.resourcesDirectory)
    .map(normalizeModel);

  // Fill in non-host relationships, and then build our schemas for the
  // Resource Definitions.
  const definitions = fillRelationships(normalizedModels)
    .map(definition => {
      return Object.assign(definition, {
        validations: buildJsonSchema(definition)
      });
    });

  log.info({
    resourcesDirectory: options.resourcesDirectory
  }, 'Successfully loaded resources from the resources directory.');

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

  router.get('/', (req, res) => {
    log.info({req}, 'A route to the root is being redirected.');
    res.redirect(`/v${apiVersion}`);
  });

  const links = {};
  resources.forEach(r => {
    const supportedActions = _.chain(r.resource.actions)
      .pickBy()
      .map((bool, name) => name)
      .value();

    links[r.resource.plural_form] = {
      href: r.location,
      meta: {
        supported_actions: supportedActions
      }
    };
  });

  // Set up the root route that describes the available endpoints.
  router.get(`/v${apiVersion}`, (req, res) => {
    log.info({req}, 'A request was made to the versioned root.');
    sendJson(res, {
      jsonapi: {
        version: '1.0',
        meta: {
          extensions: []
        }
      },
      meta: {
        api_version: `${apiVersion}`,
      },
      links
    });
  });

  // All other requests get a default 404 error.
  router.use('*', (req, res) => {
    log.info({req}, 'A 404 route was handled.');
    res.status(404);
    sendJson(res, {
      errors: [serverErrors.notFound.body()],
      links: {
        self: req.baseUrl
      }
    });
  });

  return router;
};
