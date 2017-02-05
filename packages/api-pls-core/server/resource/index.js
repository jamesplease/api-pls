'use strict';

const Controller = require('./controller');
const Routes = require('./routes');

module.exports = function({resource, version, options}) {
  var controller = new Controller(resource, options);

  var routes = new Routes({
    pluralResourceName: resource.plural_form,
    validations: resource.validations,
    controller,
    version
  });

  return {
    routes: routes.routes,
    location: routes.location
  };
};
