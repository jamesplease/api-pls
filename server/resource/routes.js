'use strict';

const controller = require('./controller');

module.exports = function({version, resourceName, routes, controller}) {
  return {
    // The root location of this resource
    location: `/v${version}/${resourceName}`,

    // Four routes for the four CRUD ops
    routes: {
      post: {
        '/': [
          controller.create
        ]
      },

      get: {
        '/': controller.read,
        '/:id': [
          controller.read
        ]
      },

      patch: {
        '/:id': [
          controller.update
        ]
      },

      delete: {
        '/:id': [
          controller.delete
        ]
      }
    }
  };
};
