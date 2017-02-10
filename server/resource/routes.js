'use strict';

const validator = require('../util/validator');
const serverErrors = require('../util/server-errors');
const sendJson = require('../util/send-json');
const log = require('../util/log');

module.exports = function({version, resource, controller}) {
  const {validations, plural_form, actions} = resource;

  const notAllowedMiddleware = [(req, res) => {
    log.info({req, res}, 'An action that is not allowed was attempted at an endpoint.');
    res.status(serverErrors.notAllowed.code);
    sendJson(res, {
      errors: [serverErrors.notAllowed.body()]
    });
  }];

  const postMiddleware = !actions.create ? notAllowedMiddleware : [
    validator(validations.create),
    controller.create
  ];
  const getManyMiddleware = !actions.readMany ? notAllowedMiddleware : [
    validator(validations.readMany),
    controller.read
  ];
  const getOneMiddleware = !actions.readOne ? notAllowedMiddleware : [
    validator(validations.readOne),
    controller.read
  ];
  const patchMiddleware = !actions.update ? notAllowedMiddleware : [
    validator(validations.update),
    controller.update
  ];
  const deleteMiddleware = !actions.delete ? notAllowedMiddleware : [
    validator(validations.delete),
    controller.delete
  ];

  return {
    // The root location of this resource
    location: `/v${version}/${plural_form}`,

    // Four routes for the four CRUD ops
    routes: {
      post: {
        '/': postMiddleware,
        '/:id': notAllowedMiddleware
      },
      get: {
        '/': getManyMiddleware,
        '/:id': getOneMiddleware
      },
      patch: {
        '/': notAllowedMiddleware,
        '/:id': patchMiddleware
      },
      delete: {
        '/': notAllowedMiddleware,
        '/:id': deleteMiddleware
      }
    }
  };
};
