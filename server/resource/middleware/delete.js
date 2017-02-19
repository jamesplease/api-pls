'use strict';

const log = require('../../util/log');
const crud = require('../../../lib/sql/crud');
const handleQueryError = require('../../util/handle-query-error');

module.exports = function(req, res) {
  log.info({req}, 'A delete request is being processed.');
  const query = crud.delete({
    tableName: this.definition.name,
    db: this.db,
    id: req.params.id
  });

  log.info({query, resourceName: this.definition.name, reqId: req.id}, 'Deleting a resource');

  this.db.one(query)
    .then(() => {
      log.info({reqId: req.id}, 'Deleted a resource');
      res.status(204).end();
    })
    .catch(err => handleQueryError({err, req, res, definition: this.definition, crudAction: 'delete', query}));
};
