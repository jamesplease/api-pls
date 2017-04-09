'use strict';

const _ = require('lodash');
const qs = require('qs');
const crud = require('../sql/crud');
const handleQueryError = require('../util/handle-query-error');
const formatTransaction = require('../util/format-transaction');
const serverErrors = require('../../api-pls-utils/server-errors');

module.exports = async function(req) {
  const pls = req.pls;

  pls.log.info({req}, 'A read request is being processed.');
  const selfLink = req.originalUrl;
  const id = req.params.id;
  const isSingular = Boolean(id);
  const pagination = pls.definition.pagination;
  const pageNumber = Number(_.get(req.query, 'page.number', pagination.default_page_number));
  const pageSize = Number(_.get(req.query, 'page.size', pagination.default_page_size));

  let paginationErrors = [];
  if (pageNumber < 1) {
    paginationErrors.push(serverErrors.outOfBoundsPagination.body('page.number'));
  }
  if (pageSize < 1) {
    paginationErrors.push(serverErrors.outOfBoundsPagination.body('page.size'));
  }

  if (paginationErrors.length) {
    return {
      code: serverErrors.outOfBoundsPagination.code,
      body: {
        errors: paginationErrors,
        links: {
          self: selfLink
        }
      }
    };
  }

  // Find the fields to return
  let fieldsToReturn = _.get(req.query, `fields.${pls.definition.plural_form}`);

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
      .filter(field => _.includes(_.map(pls.definition.attributes, 'name'), field));
  }

  let fieldsIsArray = Array.isArray(fieldsToReturn);

  // If they tried to specify fields, but none of them exist on this resource,
  // then we return an error response.
  if (fieldsIsArray && fieldsToReturn.length === 0) {
    pls.log.info({reqId: req.id}, 'A read request specified sparse fields, but provided no valid fields.');

    return {
      code: serverErrors.noValidFields.code,
      body: {
        errors: [serverErrors.noValidFields.body(pls.definition.plural_form)],
        links: {
          self: selfLink
        }
      }
    };
  }

  if (fieldsIsArray) {
    // We always need the ID, as well as the meta attributes. `fields`
    // only refers to relationships and attributes.
    fieldsToReturn = fieldsToReturn.concat('id', _.map(pls.definition.meta, 'name'));
  }

  // Only paginate if this is a readMany, and if the resource has specified
  // pagination.
  const enablePagination = !isSingular && pagination.enabled;

  // `isSingular` is whether or not we're looking for 1
  // or all. This coercion is fine because SERIALs start at 1
  const query = crud.read({
    definition: pls.definition,
    tableName: pls.definition.tableName.raw,
    db: pls.adapter.db,
    fields: fieldsToReturn,
    pageSize,
    pageNumber,
    enablePagination,
    id,
    req
  });
  const method = isSingular ? 'one' : 'any';

  pls.log.info({query, resourceName: pls.definition.name, reqId: req.id}, 'Reading a resource');

  const result = await pls.adapter.db[method](query).catch(r => r);

  const crudAction = isSingular ? 'readOne' : 'readMany';
  if (_.isError(result)) {
    return handleQueryError({
      err: result,
      definition: pls.definition,
      req, crudAction, query, selfLink,
    });
  }

  let val;

  // Singular results have no total count, so we don't do anything special.
  if (isSingular) {
    val = {result};
  }
  // If we do get results, or pagination is disabled, then it's not possible
  // that our total count is wrong.
  else if (result.length || !enablePagination) {
    val = {
      result,
      totalCount: _.get(result[0], 'total_count', 0)
    };
  }

  else {
    pls.log.info({reqId: req.id}, 'No results returned on a paginated read many.');

    const readOneAttempt = crud.read({
      definition: pls.definition,
      db: pls.adapter.db,
      pageSize: 1,
      pageNumber: 1,
      enablePagination,
      req
    });

    pls.log.info({reqId: req.id, query}, 'Follow-up paginated read many query.');
    const followUpResult = await pls.adapter.db.oneOrNone(readOneAttempt).catch(r => r);
    if (_.isError(followUpResult)) {
      return handleQueryError({
        err: followUpResult,
        definition: pls.definition,
        req, crudAction, query, selfLink,
      });
    }

    pls.log.info({reqId: req.id}, 'Successful follow-up paginated read many query.');
    const totalCount = followUpResult ? followUpResult.total_count : 0;
    val = {result: [], totalCount};
  }

  const newResult = val.result;
  let formattedResult;
  let totalCount = val.totalCount;
  if (isSingular) {
    formattedResult = formatTransaction(newResult, pls.definition, pls.version, pls.adjustResourceQuantity);
  } else {
    formattedResult = _.map(newResult, t => formatTransaction(t, pls.definition, pls.version, pls.adjustResourceQuantity));
  }

  const dataToSend = {
    data: formattedResult,
    links: {
      self: selfLink
    }
  };

  if (enablePagination) {
    const basePath = req.path;
    const numTotalCount = Number(totalCount);
    const noResources = numTotalCount === 0;
    const selfQuery = _.size(req.query) ? `?${qs.stringify(req.query, {encode: false})}` : '';
    dataToSend.links.self = `${basePath}${selfQuery}`;

    // If we have no resources, then there are no pages of data, and all
    // pagination links are null.
    if (noResources) {
      dataToSend.links.first = null;
      dataToSend.links.last = null;
      dataToSend.links.prev = null;
      dataToSend.links.next = null;
    }
    // Otherwise, we do a bit of number crunching to get the different
    // pagination links.
    else {
      const totalPages = Math.ceil(numTotalCount / pageSize);
      const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;
      let prevPage;
      // If the `pageNumber` is 1, then there is nowhere back to go.
      // If there are no results, then no previous page has any results.
      if (pageNumber === 1 || numTotalCount === 0) {
        prevPage = null;
      } else if (newResult.length === 0) {
        prevPage = totalPages;
      } else {
        prevPage = pageNumber - 1;
      }

      const firstPageQuery = qs.stringify(_.merge({}, req.query, {page: {number: 1}}), {encode: false});
      const lastPageQuery = qs.stringify(_.merge({}, req.query, {page: {number: totalPages}}), {encode: false});
      let prevPageLink = null;
      if (prevPage) {
        const prevPageQuery = qs.stringify(_.merge({}, req.query, {page: {number: prevPage}}), {encode: false});
        prevPageLink = `${basePath}?${prevPageQuery}`;
      }

      let nextPageLink = null;
      if (nextPage) {
        const nextPageQuery = qs.stringify(_.merge({}, req.query, {page: {number: nextPage}}), {encode: false});
        nextPageLink = `${basePath}?${nextPageQuery}`;
      }

      dataToSend.links.self = `${basePath}${selfQuery}`;
      dataToSend.links.first = `${basePath}?${firstPageQuery}`;
      dataToSend.links.last = `${basePath}?${lastPageQuery}`;
      dataToSend.links.prev = prevPageLink;
      dataToSend.links.next = nextPageLink;
    }

    dataToSend.meta = {
      page_number: pageNumber,
      page_size: pageSize,
      total_count: numTotalCount
    };
  }

  pls.log.info({reqId: req.id}, 'Read a resource');
  return {
    body: dataToSend
  };
};
