'use strict';

const crud = require('../../../lib/sql/crud');
const handleQueryError = require('../util/handle-query-error');

module.exports = async function(req) {
  const pls = req.pls;

  pls.log.info({req}, 'A delete request is being processed.');
  const query = crud.delete({
    tableName: pls.definition.name,
    db: pls.adapter.db,
    id: req.params.id
  });

  pls.log.info({query, resourceName: pls.definition.name, reqId: req.id}, 'Deleting a resource');

  const result = await pls.adapter.db.tx(t => {
    const primaryTableQuery = t.one(query);
    return t.batch([primaryTableQuery]);
  }).catch(r => r);

  if (result instanceof Error) {
    return handleQueryError({
      err: result,
      definition: pls.definition,
      crudAction: 'delete',
      req, query,
    });
  }

  pls.log.info({reqId: req.id}, 'Deleted a resource');
  return {
    code: 204
  };
};
