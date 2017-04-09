'use strict';

const validator = require('../util/validator');
const notAllowed = require('./middleware/not-allowed');
const checkAuthorization = require('./middleware/check-authorization');
const generateConfigRequest = require('./middleware/configure-request');
const crud = require('./middleware/crud');

module.exports = function({definition, version, adapter}) {
  const {validations, plural_form, actions} = definition;

  const configureRequest = generateConfigRequest({definition, version, adapter});

  const postMiddleware = !actions.create ? notAllowed : [
    configureRequest,
    checkAuthorization({definition, crudAction: 'create'}),
    validator(validations.create),
    crud('create')
  ];
  const getManyMiddleware = !actions.read_many ? notAllowed : [
    configureRequest,
    checkAuthorization({definition, crudAction: 'readMany'}),
    validator(validations.readMany),
    crud('read')
  ];
  const getOneMiddleware = !actions.read_one ? notAllowed : [
    configureRequest,
    checkAuthorization({definition, crudAction: 'readOne'}),
    validator(validations.readOne),
    crud('read')
  ];
  const patchMiddleware = !actions.update ? notAllowed : [
    configureRequest,
    checkAuthorization({definition, crudAction: 'update'}),
    validator(validations.update),
    crud('update')
  ];
  const deleteMiddleware = !actions.delete ? notAllowed : [
    configureRequest,
    checkAuthorization({definition, crudAction: 'delete'}),
    validator(validations.delete),
    crud('del')
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
    },

    definition
  };
};
