'use strict';

const controller = require('./controller');
const validator = require('../util/validator');
const jsonApiHeaders = require('../util/json-api-headers');

module.exports = function({version, pluralResourceName, routes, controller, validations}) {
  return {
    // The root location of this resource
    location: `/v${version}/${pluralResourceName}`,

    // Four routes for the four CRUD ops
    routes: {
      post: {
        '/': [
          jsonApiHeaders,
          validator(validations.create),
          controller.create
        ]
      },

      get: {
        '/': [
          jsonApiHeaders,
          validator(validations.readMany),
          controller.read
        ],
        '/:id': [
          jsonApiHeaders,
          validator(validations.readOne),
          controller.read
        ]
      },

      patch: {
        '/:id': [
          jsonApiHeaders,
          validator(validations.update),
          controller.update
        ]
      },

      delete: {
        '/:id': [
          jsonApiHeaders,
          validator(validations.delete),
          controller.delete
        ]
      }
    }
  };
};
