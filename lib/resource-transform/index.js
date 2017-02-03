'use strict';

// This transforms a resource definition. It generates a migration and a
// resource description file.

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const normalizeAttributes = require('./util/normalize-attributes');
const generateValidations = require('./util/generate-validations');

const createTemplatePath = path.join(__dirname, './templates/create-migration.ejs');
const createMigrationTemplate = fs.readFileSync(createTemplatePath);

module.exports = function(rawResource) {
  const resource = _.merge(
    {
      // "book" => "books"
      plural_form: rawResource.name + 's',
      attributes: {},
      // All resources get these unless they opt out of them
      built_in_attributes: {
        created_at: true,
        updated_at: true
      }
    },
    rawResource
  );

  resource.attributes = normalizeAttributes(resource.attributes);

  const definition = Object.assign(
    _.pick(resource, ['name', 'plural_form']),
    {
      attributes: Object.keys(resource.attributes),
      validations: generateValidations(resource)
    }
  );

  const migration = _.template(createMigrationTemplate)(resource);

  return {
    definition: definition,
    migration: migration
  };
}
