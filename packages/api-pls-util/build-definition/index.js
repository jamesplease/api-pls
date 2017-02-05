'use strict';

// This transforms a resource definition. It generates a migration and a
// resource description file.

const _ = require('lodash');
const normalizeAttributes = require('./util/normalize-attributes');
const generateValidations = require('./util/generate-validations');
const buildInitialMigration = require('./util/build-initial-migration');

// A `resourceModel` is what the user defines in their `resources` directory,
// inside of a YAML or JSON file.
// This outputs a `resourceDefinition`.
// The difference is that models are incomplete descriptions of the resource,
// whereas a definition is a complete description. Notable differences:
//
// 1. Resource models can omit certain fields, which indicates that the default
//    is okay. Resource definitions are explicit and have no omissions.
// 2. Resource definitions contain computed data, such as the JSON Schema
//    of the resource model.
//
// Eventually, resource models might be database-agnostic, whereas a resource
// definition would be database-specific.
module.exports = function(resourceModel) {
  const resource = _.merge(
    {
      // "book" => "books"
      plural_form: `${resourceModel.name}s`,
      attributes: {},
      // All resources get these unless they opt out of them
      built_in_attributes: {
        created_at: true,
        updated_at: true
      }
    },
    resourceModel
  );

  resource.attributes = normalizeAttributes(resource.attributes);

  const definition = Object.assign(
    _.pick(resource, ['name', 'plural_form']),
    {
      attributes: Object.keys(resource.attributes),
      validations: generateValidations(resource)
    }
  );

  const migration = buildInitialMigration(resource);

  return {
    definition,
    migration
  };
};
