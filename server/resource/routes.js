'use strict';

const validator = require('../util/validator');
const notAllowed = require('./middleware/not-allowed');
const checkAuthorization = require('./middleware/check-authorization');

module.exports = function({version, definition, controller}) {
  const {validations, plural_form, actions} = definition;

  const postMiddleware = !actions.create ? notAllowed : [
    checkAuthorization({definition, crudAction: 'create'}),
    validator(validations.create),
    controller.create
  ];
  const getManyMiddleware = !actions.read_many ? notAllowed : [
    checkAuthorization({definition, crudAction: 'readMany'}),
    validator(validations.readMany),
    controller.read
  ];
  const getOneMiddleware = !actions.read_one ? notAllowed : [
    checkAuthorization({definition, crudAction: 'readOne'}),
    validator(validations.readOne),
    controller.read
  ];
  const patchMiddleware = !actions.update ? notAllowed : [
    checkAuthorization({definition, crudAction: 'update'}),
    validator(validations.update),
    controller.update
  ];
  const deleteMiddleware = !actions.delete ? notAllowed : [
    checkAuthorization({definition, crudAction: 'delete'}),
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
