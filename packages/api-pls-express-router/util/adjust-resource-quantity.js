'use strict';

const _ = require('lodash');

let resources = [];

module.exports = {
  // Call this when the resources are loaded. It stores all of the resources
  // with their names.
  setResources(resourceList) {
    resources = resourceList;
  },

  // Pass in singular `resourceName`, and you get back the plural form of it.
  getPluralName(resourceName) {
    const resource = _.find(resources, {name: resourceName});
    return resource ? resource.plural_form : resourceName;
  },

  // Pass in plural `resourceName`, and you get back the singular form of it.
  getSingularName(resourceName) {
    const resource = _.find(resources, {plural_form: resourceName});
    return resource ? resource.name : resourceName;
  }
};
