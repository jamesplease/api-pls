'use strict';

const log = require('../../util/log');

// This sets some data on the `req` Object under the `pls` key, so that
// later middlewares can use this data.
module.exports = function({definition, version, adapter}) {
  const pls = {adapter, definition, version, log};

  return function(req, res, next) {
    req.pls = pls;
    next();
  };
};
