'use strict';

const controller = require('./controller');
// const validator = require('../../util/validator');
// const validations = require('./validations');

module.exports = function({version, resourceName, routes, controller}) {
  return {
    location: `/v${version}/${resourceName}`,
    routes: {
      post: {
        '/': [
          // validator(validations.create),
          controller.create
        ]
      },

      get: {
        '/': controller.read,
        '/:id': [
          // validator(validations.readOne),
          controller.read
        ]
      },

      patch: {
        '/:id': [
          // validator(validations.update),
          controller.update
        ]
      },

      delete: {
        '/:id': [
          // validator(validations.destroy),
          controller.delete
        ]
      }
    }
  };
};
