'use strict';

global.TESTING = true;
global.assert = require('assert');
global.sinon = require('sinon');

beforeEach(() => {
  // Using these globally-available Sinon features is preferrable, as they're
  // automatically restored for you in the subsequent `afterEach`
  global.sandbox = global.sinon.sandbox.create();
  global.stub = global.sandbox.stub.bind(global.sandbox);
  global.spy = global.sandbox.spy.bind(global.sandbox);
  global.mock = global.sandbox.mock.bind(global.sandbox);
  global.useFakeTimers = global.sandbox.useFakeTimers.bind(global.sandbox);
  global.useFakeXMLHttpRequest = global.sandbox.useFakeXMLHttpRequest.bind(global.sandbox);
  global.useFakeServer = global.sandbox.useFakeServer.bind(global.sandbox);
});

afterEach(() => {
  delete global.stub;
  delete global.spy;
  global.sandbox.restore();
});
