'use strict';

const Controller = require('./controller');
const Routes = require('./routes');

module.exports = function({definition, version, db, adapter}) {
  var controller = new Controller({definition, version, db});

  var routes = new Routes({
    definition,
    controller,
    version,
    adapter
  });

  return {
    routes: routes.routes,
    location: routes.location,
    definition
  };
};
