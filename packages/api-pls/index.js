'use strict';

const app = require('./server/app');
const log = require ('./server/util/log');

module.exports = function(options) {
  app(options);
}

process.on('uncaughtException', (err) => {
  log.fatal({err}, 'Uncaught exception')
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  const logObj = {};

  // Assign the `reason` to the `err` key if it is
  // an error. This is so that Bunyan's error serializer
  // picks it up.
  if (reason instanceof Error) {
    logObj.err = reason;
  }
  // If it's not an error, we just pass it through.
  else {
    logObj.reason = reason;
  }

  log.warn(logObj, 'Unhandled Promise rejection');
});
