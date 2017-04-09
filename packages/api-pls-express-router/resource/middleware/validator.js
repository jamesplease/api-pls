'use strict';

const Ajv = require('ajv');
const requestErrorMap = require('../../util/bad-request-map');
const sendJson = require('../../util/send-json');
const log = require('../../util/log');

const ajv = new Ajv({allErrors: true, v5: true});

// This determines if a user's HTTP request to a particular endpoint is valid.
// It works by passing a `schema` from a Resource's validations through
// `ajv`.
module.exports = function(schema) {
  const validate = ajv.compile(schema);
  return function(req, res, next) {
    if (validate(req)) {
      next();
    } else {
      log.info({req}, 'A request failed validation.');
      res.status(400);
      sendJson(res, {
        errors: requestErrorMap(validate.errors),
        links: {
          self: req.path
        }
      });
    }
  };
};
