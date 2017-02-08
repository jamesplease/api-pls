'use strict';

module.exports = function(options) {
  if (!options.test) {
    var ssl = options.ssl ? '?ssl=true' : '';
    return `${options.DATABASE_URL}${ssl}`;
  }

  // This configuration works on Travis CI. It's also straightforward to setup
  // locally. Just make sure that a superuser named `postgres` exists:
  // `createuser -s postgres`
  else {
    return {
      host: 'localhost',
      user: 'postgres',
      database: 'api_pls_test_db',
      password: undefined
    };
  }
};
