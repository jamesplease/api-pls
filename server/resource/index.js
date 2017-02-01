'use strict';

const Controller = require('./controller');
const Routes = require('./routes');

module.exports = function({resource, version}) {
  var controller = new Controller({
    table: resource.name
  });

  var routes = new Routes({
    resourceName: resource.name,
    controller,
    version,
    version,
    validations: resource.validations
  });

  return {
    routes: routes.routes,
    location: routes.location
  };
};
