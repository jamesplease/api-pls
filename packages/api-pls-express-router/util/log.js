'use strict';

const pino = require('pino');

const NODE_ENV = process.env.NODE_ENV || 'development';
const isDevEnv = NODE_ENV === 'development';

function definitionSerializer(definition) {
  return {
    resourceName: definition.name
  };
}

function reqSerializer(req) {
  return Object.assign(pino.stdSerializers.req(req), {
    reqId: req.id
  });
}

const log = pino({
  name: 'api-pls-router',
  serializers: Object.assign({}, pino.stdSerializers, {
    req: reqSerializer,
    definition: definitionSerializer
  }),
  src: isDevEnv,
  prettyPrint: isDevEnv
});

module.exports = log;
