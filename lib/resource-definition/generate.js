'use strict';

const _ = require('lodash');
const sqlUtil = require('../sql/sql-util');
const buildJsonSchema = require('./build-json-schema');

// Some of the properties of the Resource Models are objects, because that
// minimizes the typing that a human has to do. But they are more useful to us
// as an array, so we convert those things to an array here.
// For instance, attributes:
//
// attributes:
//   first_name:
//     type: 'VARCHAR(30)'
//
// becomes...
//
// {
//   attributes: [
//     {
//       name: 'first_name',
//       type: 'VARCHAR(30)'
//     }
//   ]
// }
//
// You can customize the "key" with the second argument (it defaults to "name")
function mapObjToArray(obj, key = 'name') {
  return _.map(obj, (v, k) => Object.assign(v, {[key]: k}));
}

// Maps a Model to its Definition
function generateDefinition(model) {
  return {
    name: model.name,
    plural_form: model.plural_form,
    tableName: sqlUtil.getTableName(model),
    escapedTableName: sqlUtil.getTableName(model, {escape: true}),
    idColumnName: sqlUtil.getIdColumnFromResource(model),
    escapedIdColumnName: sqlUtil.getIdColumnFromResource(model, {escaped: true}),
    actions: model.actions,
    // This should probably be calculated here, rather than put on the model.
    validations: buildJsonSchema(model),
    pagination: model.pagination,
    attributes: mapObjToArray(model.attributes),
    relationships: mapObjToArray(model.relationships),
    meta: mapObjToArray(model.meta),
    // Also attach the user-inputted model, just in case.
    model
  };
}

// Resource Definitions are "enhanced" versions of the Resource Model. They're
// transformed slightly to be more useful to the server, and a handful of
// computed properties goes on the Definition.
module.exports = function(resourceModels) {
  return _.map(resourceModels, generateDefinition);
};
