'use strict';

const _ = require('lodash');
const express = require('express');
const routeBuilder = require('express-routebuilder');
const bodyParser = require('body-parser');
const contentType = require('content-type');
const Resource = require('./resource');
const serverErrors = require('./util/server-errors');
const sendJson = require('./util/send-json');
const jsonApiHeaders = require('./util/json-api-headers');
const generateDefinitions = require('../lib/resource-definition/generate-from-raw');
const adjustResourceQuantity = require('./util/adjust-resource-quantity');
const jsonApiMediaType = require('./util/json-api-media-type');
const log = require('./util/log');

module.exports = function(options) {
  const router = express.Router();
  router.use(jsonApiHeaders);

  const apiVersion = options.apiVersion;
  const adapter = options.adapter;

  const definitions = generateDefinitions(options.resourceModels);
  adjustResourceQuantity.setResources(definitions);

  var resources = definitions.map(definition => new Resource({
    version: apiVersion,
    definition,
    adapter,
  }));

  // Parse bodies to JSON that have the "standard" JSON media type as well as
  // the JSON API media type.
  router.use(bodyParser.json({type: req => {
    let contentTypeObj = {};
    try {
      contentTypeObj = contentType.parse(req);
    } catch (e) {
      // Intentionally blank
    }
    const type = contentTypeObj.type;
    return type === 'application/json' || type === jsonApiMediaType;
  }}));

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
    const supportedActions = _.chain(r.definition.actions)
      .pickBy()
      .map((bool, name) => name)
      .value();

    links[r.definition.plural_form] = {
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
