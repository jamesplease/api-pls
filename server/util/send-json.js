'use strict';

// This method gets around Express' weird behavior of adding a media type
// parameters when you use `send`. This should be used instead everywhere to
// adhere to JSON API.
// For more on Express' behavior:
// https://github.com/expressjs/express/issues/2921
module.exports = function(res, body) {
  return res.send(new Buffer(JSON.stringify(body)));
};
