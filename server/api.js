'use strict';

const express = require('express');
const routeBuilder = require('express-routebuilder');
const Resource = require('./resource');

// const migrate = require('./util/migrate');
// const resources = require('./resources');

// migrate.up();

const router = express.Router();

// What version this API is. Eventually this could be automated...perhaps?
var apiVersion = 1;

// The names of our resources. This needs to be substituted for resource
// definitions.
var resourceNames = [
  'transaction',
  'category'
];

var resources = resourceNames.map(name => new Resource({
  version: apiVersion,
  name
}));

// Configure routes for our resources.
resources.forEach(resource => {
  router.use(routeBuilder(
    express.Router(),
    resource.routes,
    resource.location
  ));
});

// Set up the root route that describes the available endpoints.
router.get('/', (req, res) => {
  res.send({
    version: 'v1',
    endpoints: resources.map(resource => {
      return {
        route: resource.location,
        methods: Object.keys(resource.routes)
      };
    })
  });
});

module.exports = router;
