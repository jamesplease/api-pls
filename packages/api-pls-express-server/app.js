'use strict';

const helmet = require('helmet');
const cors = require('cors');
const express = require('express');
const addRequestId = require('express-request-id');
const compress = require('compression');
const bodyParser = require('body-parser');
const log = require('./log');
const loadResourceModels = require('../../lib/resource-model/load-from-disk');
const postgresAdapter = require('../../adapters/postgres');
const ApiRouter = require('../../packages/api-pls-express-router');

const NODE_ENV = process.env.NODE_ENV || 'development';

// This is an Express app that mounts your API endpoints. It's useful to use if
// you don't need to customize the behavior of api-pls programmatically.
module.exports = function(options) {
  const app = express();

  app.set('env', NODE_ENV);

  // Enable all CORS requests, for now
  app.use(cors());
  app.use(helmet({
    // This application should never appear in an iFrame
    frameguard: {action: 'deny'},
    // No HTTPS at the moment. I know, I know...
    hsts: false,
    noCache: {}
  }));

  app.use(bodyParser.urlencoded({extended: true}));
  app.use(compress());
  app.use(addRequestId({
    // We're using this middleware for logging purposes. Each request having
    // a unique ID can help filter many requests coming in. If we set it as a
    // header, we'd get the benefit of Pino automatically logging it. But
    // then we'd also be sending it over the wire unnecessarily. So we turn
    // that off, which means we must remember to attach the `req.id` to all logs
    // that are sent a request. i.e.; `log.info({reqId: req.id})`
    setHeader: false
  }));

  log.info({
    resourcesDirectory: options.resourcesDirectory
  }, 'Loading resources from the resources directory.');

  var resourceModels = loadResourceModels(options.resourcesDirectory);

  log.info({
    resourcesDirectory: options.resourcesDirectory
  }, 'Successfully loaded resources from the resources directory.');

  // Register the API
  const routerOptions = Object.assign({}, options, {
    adapter: new postgresAdapter(options),
    resourceModels
  });

  app.use(ApiRouter(routerOptions));

  const port = options.port;
  app.set('port', port);

  if (!global.TESTING) {
    app.listen(port, () => log.info(`Node app running at localhost:${port}`));
  }

  return app;
};
