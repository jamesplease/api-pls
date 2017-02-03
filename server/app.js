'use strict';

const helmet = require('helmet');
const cors = require('cors');
const express = require('express');
const addRequestId = require('express-request-id');
const compress = require('compression');
const bodyParser = require('body-parser');
const log = require('./util/log');

const envPath = global.ENV_PATH ? global.ENV_PATH : '.env';
require('dotenv').config({path: envPath});

const dbConfig = require('../config/db-config');
const api = require('./api');

// Heroku sets NODE_ENV to production by default. So if we're not
// on Heroku, we assume that we're developing locally.
const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = function() {
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
  app.use(bodyParser.json({type:'application/vnd.api+json'}));
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(compress());
  app.use(addRequestId({
    // We're using this middleware for logging purposes. Each request having
    // a unique ID can help filter many requests coming in. If we set it as a
    // header, we'd get the benefit of Bunyan automatically logging it. But
    // then we'd also be sending it over the wire unnecessarily. So we turn
    // that off, which means we must remember to attach the `req.id` to all logs
    // that are sent a request. i.e.; `log.info({reqId: req.id})`
    setHeader: false
  }));

  // Register the API
  app.use(api());

  const port = process.env.PORT || 5000;
  app.set('port', port);

  if (!global.TESTING) {
    app.listen(port, () => log.info(`Node app running at localhost:${port}`));
  }

  return app;
};
