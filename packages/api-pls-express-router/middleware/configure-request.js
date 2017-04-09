'use strict';

const log = require('../util/log');
const adjustResourceQuantity = require('../util/adjust-resource-quantity');

// This sets some data on the `req` Object under the `pls` key, so that
// later middlewares can use this data.
module.exports = function({definition, version, adapter}) {
  const pls = {adapter, definition, version, adjustResourceQuantity, log};

  return function(req, res, next) {
    req.pls = pls;
    next();
  };
};
