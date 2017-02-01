'use strict';

const bunyan = require('bunyan');

const NODE_ENV = process.env.NODE_ENV || 'development';
const isDevEnv = NODE_ENV === 'development';

module.exports = bunyan.createLogger({
  name: 'JSON-API-Builder',
  serializers: bunyan.stdSerializers,
  src: isDevEnv
});
