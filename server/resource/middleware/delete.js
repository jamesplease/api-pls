'use strict';

const _ = require('lodash');
const log = require('../../util/log');
const crud = require('../../../lib/sql/crud');
const handleQueryError = require('../../util/handle-query-error');

module.exports = async function(req, res) {
  log.info({req}, 'A delete request is being processed.');
  const query = crud.delete({
    tableName: this.definition.name,
    db: this.db,
    id: req.params.id
  });

  log.info({query, resourceName: this.definition.name, reqId: req.id}, 'Deleting a resource');

  const result = await this.db.one(query).catch(r => r);
  if (_.isError(result)) {
    return handleQueryError({
      err: result,
      definition: this.definition,
      crudAction: 'delete',
      req, res, query,
    });
  }

  log.info({reqId: req.id}, 'Deleted a resource');
  res.status(204).end();
};
