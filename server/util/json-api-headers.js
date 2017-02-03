'use strict';

const _ = require('lodash');
const accepts = require('accepts');
const contentType = require('content-type');
const sendJson = require('./send-json');

//
// This module does three things with headers:
//
// 1. Checks request header to make sure that if they specified that they've
//    sent over data with the JSON API content type, that it has no params. If
//    it does, then we error out.
//
// 2. Checks request header that if they've specified that they accept the JSON
//    API content type, that they have no parameters. If they do, then we error
//    out.
//
// 3. If everything checks out, then we add the JSON API content-type header.
//
module.exports = function(req, res, next) {
  let contentTypeObj = {};
  try {
    contentTypeObj = contentType.parse(req);
  } catch(e) {
    // Intentionally blank
  }

  const hasJsonApiType = contentTypeObj.type === 'application/vnd.api+json';
  const hasParameters = _.size(contentTypeObj.parameters);

  if (hasJsonApiType && hasParameters) {
    res.status(415);
    return sendJson(res, {}).end();
  }

  const acceptsJsonApi = accepts(req).types(['application/vnd.api+json']);

  if (!acceptsJsonApi) {
    res.status(406);
    return sendJson(res, {}).end();
  }

  res.type('application/vnd.api+json');
  next();
}
