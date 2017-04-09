'use strict';

const serverErrors = require('../util/server-errors');
const sendJson = require('../util/send-json');
const log = require('../util/log');

module.exports = function({definition, crudAction}) {
  const {isAuthorized, name} = definition;

  return function(req, res, next) {
    log.info({req}, `Validating ${crudAction} request to ${name}`);
    const userIsAuthorized = isAuthorized({
      resourceDefinition: definition,
      req, crudAction
    });
    if (userIsAuthorized) {
      log.info({reqId: req.reqId}, `An authorized ${crudAction} request was made to ${name}`);
      return next();
    } else {
      log.info({reqId: req.reqId}, `An unauthorized ${crudAction} request was made to ${name}`);
      res.status(serverErrors.unauthorized.code);
      sendJson(res, {
        errors: [serverErrors.unauthorized.body()],
        links: {
          self: req.path
        }
      });
    }
  };
};
