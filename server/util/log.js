'use strict';

const bunyan = require('bunyan');

const NODE_ENV = process.env.NODE_ENV || 'development';
const isDevEnv = NODE_ENV === 'development';

function resourceSerializer(resource) {
  return {
    resourceName: resource.name
  };
}

const log = bunyan.createLogger({
  name: 'JSON-API-Builder',
  serializers: bunyan.stdSerializers,
  src: isDevEnv
});

log.addSerializers({
  resource: resourceSerializer
})

module.exports = log;
