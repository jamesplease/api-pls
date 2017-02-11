'use strict';

const _ = require('lodash');
const log = require('../../util/log');
const baseSql = require('../../util/base-sql');
const serverErrors = require('../../util/server-errors');
const sendJson = require('../../util/send-json');
const handleQueryError = require('../../util/handle-query-error');
const formatTransaction = require('../../util/format-transaction');

module.exports = function(req, res) {
  const selfLink = req.path;
  const id = req.params.id;
  const isSingular = Boolean(id);

  const pagination = this.resource.pagination;
  const pageNumber = Number(_.get(req.query, 'page.number', pagination.default_page_number));
  const pageSize = Number(_.get(req.query, 'page.size', pagination.default_page_size));

  // Find the fields to return
  let fieldsToReturn = _.get(req.query, `fields.${this.resource.plural_form}`, '*');

  // This captures if the user specifies the parameter, but doesn't actually
  // enter a value.
  if (!fieldsToReturn) {
    fieldsToReturn = '*';
  }

  // The user can pass in comma-separated fields. i.e.
  // ?fields[people]=first_name,last_name,address
  // to just get those fields.
  if (fieldsToReturn !== '*') {
    fieldsToReturn = fieldsToReturn
      .split(',')
      // Ensure only valid fields are specified
      .filter(field => _.includes(Object.keys(this.resource.attributes), field));
  }

  let fieldsIsArray = Array.isArray(fieldsToReturn);

  // If they tried to specify fields, but none of them exist on this resource,
  // then we return an error response.
  if (fieldsIsArray && fieldsToReturn.length === 0) {
    log.info({req, res}, 'A read request specified sparse fields, but provided no valid fields.');
    res.status(serverErrors.noValidFields.code);
    sendJson(res, {
      errors: [serverErrors.noValidFields.body(this.resource.plural_form)],
      links: {
        self: selfLink
      }
    });
    res.end();
    return;
  }

  if (fieldsIsArray) {
    // We always need the ID, as well as the meta attributes. `fields`
    // only refers to relationships and attributes.
    fieldsToReturn = fieldsToReturn.concat('id', Object.keys(this.resource.meta));
  }

  // Only paginate if this is a readMany, and if the resource has specified
  // pagination.
  const enablePagination = !isSingular && pagination.enabled;

  // `isSingular` is whether or not we're looking for 1
  // or all. This coercion is fine because SERIALs start at 1
  const query = baseSql.read({
    tableName: this.resource.name,
    db: this.db,
    fields: fieldsToReturn,
    pageSize,
    pageNumber,
    enablePagination,
    id
  });
  const method = isSingular ? 'one' : 'any';

  log.info({query, resourceName: this.resource.name, reqId: req.id}, 'Reading a resource');

  this.db[method](query)
    .then(result => {
      let formattedResult;
      let totalCount;
      if (!Array.isArray(result)) {
        formattedResult = formatTransaction(result, this.resource, this.version);
      } else {
        totalCount = result.length ? result[0].total_count : 0;
        formattedResult = _.map(result, t => formatTransaction(t, this.resource, this.version));
      }

      const dataToSend = {
        data: formattedResult,
        links: {
          self: selfLink
        }
      };

      if (enablePagination) {
        dataToSend.meta = {
          page_number: pageNumber,
          page_size: pageSize,
          total_count: Number(totalCount)
        };
      }

      log.info({query, resourceName: this.resource.name, reqId: req.id}, 'Read a resource');
      sendJson(res, dataToSend);
    })
    .catch(err => {
      const crudAction = isSingular ? 'readOne' : 'readMany';
      handleQueryError({err, req, res, resource: this.resource, crudAction, query, selfLink});
    });
};
