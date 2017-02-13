'use strict';

const log = require('../../util/log');
const baseSql = require('../../util/base-sql');
const handleQueryError = require('../../util/handle-query-error');

module.exports = function(req, res) {
  log.info({req}, 'A delete request is being processed.');
  const query = baseSql.delete({
    tableName: this.resource.name,
    db: this.db,
    id: req.params.id
  });

  log.info({query, resourceName: this.resource.name, reqId: req.id}, 'Deleting a resource');

  this.db.one(query)
    .then(() => {
      log.info({reqId: req.id}, 'Deleted a resource');
      res.status(204).end();
    })
    .catch(err => handleQueryError({err, req, res, resource: this.resource, crudAction: 'delete', query}));
};
