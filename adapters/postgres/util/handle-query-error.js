'use strict';

const pgp = require('pg-promise');
// Using let for these due to rewiring the tests Is that ideal? No, it stinks.
let mapPgError = require('./map-pgp-error');
const serverErrors = require('../../../lib/server-errors');

// Call this when a query fails, and the response will be properly handled.
module.exports = function({err, req, definition, crudAction, query, selfLink}) {
  const pls = req.pls;
  var serverError;

  // First, check to see if it's a pgp QueryResultError. If it
  // is, we generate the appropriate server error.
  if (err instanceof pgp.errors.QueryResultError) {
    serverError = mapPgError(err.code);
  }

  // If it's not a pgp QueryResultError, we send over tbe generic server error.
  else {
    serverError = serverErrors.generic;
  }

  const dataToSend = {
    errors: [serverError.body()]
  };

  if (selfLink) {
    dataToSend.links = {
      self: selfLink
    };
  }

  pls.log.warn({
    resourceName: pls.  definition.name,
    reqId: req.id,
    err, crudAction, query
  }, 'There was a query error with a CRUD request.');

  return {
    code: serverError.code,
    body: dataToSend
  };
};
