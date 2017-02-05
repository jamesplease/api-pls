'use strict';

const _ = require('lodash');
const accepts = require('accepts');
const contentType = require('content-type');
const sendJson = require('./send-json');
const serverErrors = require('./server-errors');
const jsonApiMediaType = require('./json-api-media-type');

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
  } catch (e) {
    // Intentionally blank
  }

  const hasJsonApiType = contentTypeObj.type === jsonApiMediaType;
  const hasParameters = _.size(contentTypeObj.parameters);

  if (hasJsonApiType && hasParameters) {
    res.status(serverErrors.contentTypeHasParams.code);
    return sendJson(res, serverErrors.contentTypeHasParams.body()).end();
  }

  const acceptsJsonApi = accepts(req).types([jsonApiMediaType]);

  if (!acceptsJsonApi) {
    res.status(serverErrors.acceptsHasParams.code);
    return sendJson(res, serverErrors.acceptsHasParams.body()).end();
  }

  // Some browsers (like Safari Version 10.0.3 (12602.4.8)) will force the user
  // to download content if it has the JSON API media type. Presently, at least
  // that browser also ignores the Content-Disposition header, so we must use
  // the non-standard `application/json`.
  res.type('application/json');
  // Attempt to tell browsers that we want to display this in the browser,
  // rather than download it.
  res.header('Content-Disposition', 'inline');
  next();
};
