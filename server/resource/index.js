'use strict';

const Controller = require('./controller');
const Routes = require('./routes');

module.exports = function({resource, version}) {
  const name = resource.name;
  var controller = new Controller({
    table: name
  });

  var routes = new Routes({
    resourceName: name,
    controller,
    version,
    version
  });

  return {
    routes: routes.routes,
    location: routes.location
  };
};
