'use strict';

// Types: Postgres data types
// Formats: JSON Schema Formats
//
// The purpose of this is to enforce, from the JavaScript layer, whether or not
// a particular bit of JSON will be able to be inserted into the DB.
//

// This will likely need to become a function to support types and formats. For
// instance, "VARCHAR(30)" and "VARCHAR(15)", which should both map to the
// JSON Schema type "string", whereas "DATE" maps to the format of "date".
module.exports = {
  DATE: 'date'
};
