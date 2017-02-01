'use strict';

const controller = require('./controller');
const validator = require('../util/validator');

module.exports = function({version, resourceName, routes, controller, validations}) {
  return {
    // The root location of this resource
    location: `/v${version}/${resourceName}`,

    // Four routes for the four CRUD ops
    routes: {
      post: {
        '/': [
          validator(validations.create),
          controller.create
        ]
      },

      get: {
        '/': [
          validator(validations.readMany),
          controller.read
        ],
        '/:id': [
          validator(validations.readOne),
          controller.read
        ]
      },

      patch: {
        '/:id': [
          validator(validations.update),
          controller.update
        ]
      },

      delete: {
        '/:id': [
          validator(validations.delete),
          controller.delete
        ]
      }
    }
  };
};
