'use strict';

const Controller = require('./controller');
const Routes = require('./routes');

module.exports = function({resource, version, db}) {
  var controller = new Controller({resource, version, db});

  var routes = new Routes({
    resource,
    controller,
    version
  });

  return {
    routes: routes.routes,
    location: routes.location,
    resource
  };
};
