'use strict';

const validator = require('../util/validator');
const notAllowed = require('./middleware/not-allowed');

module.exports = function({version, resource, controller}) {
  const {validations, plural_form, actions} = resource;

  const postMiddleware = !actions.create ? notAllowed : [
    validator(validations.create),
    controller.create
  ];
  const getManyMiddleware = !actions.read_many ? notAllowed : [
    validator(validations.readMany),
    controller.read
  ];
  const getOneMiddleware = !actions.read_one ? notAllowed : [
    validator(validations.readOne),
    controller.read
  ];
  const patchMiddleware = !actions.update ? notAllowed : [
    validator(validations.update),
    controller.update
  ];
  const deleteMiddleware = !actions.delete ? notAllowed : [
    validator(validations.delete),
    controller.del
  ];

  return {
    // The root location of this resource
    location: `/v${version}/${plural_form}`,

    // Four routes for the four CRUD ops
    routes: {
      post: {
        '/': postMiddleware,
        '/:id': notAllowed
      },
      get: {
        '/': getManyMiddleware,
        '/:id': getOneMiddleware
      },
      patch: {
        '/': notAllowed,
        '/:id': patchMiddleware
      },
      delete: {
        '/': notAllowed,
        '/:id': deleteMiddleware
      }
    }
  };
};
