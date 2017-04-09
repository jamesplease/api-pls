'use strict';

module.exports = function(type) {
  return async function(req, res) {
    const result = await req.pls.adapter.crud[type](req);
    const responseCode = result.code ? result.code : 200;
    res.status(responseCode).set(result.headers);

    if (result.body) {
      res.send(new Buffer(JSON.stringify(result.body)));
    } else {
      res.end();
    }
  };
};
