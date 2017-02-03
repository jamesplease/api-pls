'use strict';

// This module checks the request headers to ensure they comply with the JSON
// API spec. If they do, then we add the proper response headers.
module.exports = function(req, res, next) {
  // Todo: check for request headers and send an error body
  if (false) {
    res.status(415).send({}).end();
  }

  // Todo: same as above
  else if (false) {
    res.status(406).send({}).end();
  }

  res.setHeader('Content-Type', 'application/vnd.api+json');
  next();
}
