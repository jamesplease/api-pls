// This is pretty much the same code that's in the `reset-database` command.
// It should probably be converted to a shared utility.
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
