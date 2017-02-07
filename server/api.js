'use strict';

const _ = require('lodash');
const express = require('express');
const routeBuilder = require('express-routebuilder');
const Resource = require('./resource');
const serverErrors = require('./util/server-errors');
const loadResourceModels = require('../util/load-resource-models');
const normalizeModel = require('../util/normalize-model');
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
      const normalized = normalizeModel(resourceModel);
      return Object.assign(normalized, {
        validations: buildJsonSchema(normalized)
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

  const links = {};
  resources.forEach(r => {
    const allowedMethods = _.chain(r.resource.actions)
      .pickBy()
      .map((bool, name) => name)
      .value();

    links[r.resource.name] = {
      link: r.location,
      meta: {
        methods: allowedMethods
      }
    };
  });

  // Set up the root route that describes the available endpoints.
  router.get(`/v${apiVersion}`, (req, res) => {
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
  router.get('*', (req, res) => {
    res.status(404);
    sendJson(res, {
      errors: [serverErrors.notFound.body()]
    });
  });

  return router;
};
