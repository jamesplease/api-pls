'use strict';

const pino = require('pino');

const pretty = pino.pretty();
pretty.pipe(process.stdout);

const NODE_ENV = process.env.NODE_ENV || 'development';
const isDevEnv = NODE_ENV === 'development';

function resourceSerializer(resource) {
  return {
    resourceName: resource.name
  };
}

const log = pino({
  name: 'api-pls',
  serializers: Object.assign({
    resource: resourceSerializer
  }, pino.stdSerializers),
  src: isDevEnv
}, pretty);

module.exports = log;
