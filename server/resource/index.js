'use strict';

const Routes = require('./routes');

module.exports = function({definition, version, adapter}) {
  var routes = new Routes({
    definition,
    version,
    adapter
  });

  return {
    routes: routes.routes,
    location: routes.location,
    definition
  };
};
