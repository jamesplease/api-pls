'use strict';

const serverErrors = require('../../util/server-errors');
const sendJson = require('../../util/send-json');
const log = require('../../util/log');

module.exports = function(req, res) {
  log.info({req}, 'An action that is not allowed was attempted at an endpoint.');
  res.status(serverErrors.notAllowed.code);
  sendJson(res, {
    errors: [serverErrors.notAllowed.body()],
    links: {
      self: req.path
    }
  });
};
