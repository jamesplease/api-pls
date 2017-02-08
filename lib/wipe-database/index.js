'use strict';

const wipeDb = `DROP SCHEMA public CASCADE;
  CREATE SCHEMA public;
  GRANT ALL ON SCHEMA public TO postgres;
  GRANT ALL ON SCHEMA public TO public;
  COMMENT ON SCHEMA public IS 'standard public schema';`;

// Wipes the database.
// Returns a Promise that resolves if the wipe succeeds, and rejects if it
// fails.
module.exports = function(db) {
  return db.query(wipeDb);
};
