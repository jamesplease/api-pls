'use strict';

const pgp = require('pg-promise');

// Many-to-many relationships are stored in an associative table. This
// function generates the name of that table from the host and guest names.
function getAssociativeTableName({host, guest, escaped}) {
  const rawName = `${host.name}_${guest.name}`;
  return escaped ? pgp.as.name(rawName) : rawName;
}

// This returns the name of the column for the host's ID.
function getHostIdColumnName({host, escaped}) {
  const rawName = `${host.name}_id`;
  return escaped ? pgp.as.name(rawName) : rawName;
}

// This returns the name of the column for the guest's ID.
function getGuestIdColumnName({guest, escaped}) {
  const rawName = `${guest.name}_id`;
  return escaped ? pgp.as.name(rawName) : rawName;
}

// This returns the name of the primary key column.
function getPrimaryKeyColumnName({host, guest, escaped}) {
  const rawName = `${host.name}_${guest.name}_pkey`;
  return escaped ? pgp.as.name(rawName) : rawName;
}

module.exports = {
  getAssociativeTableName, getHostIdColumnName, getGuestIdColumnName,
  getPrimaryKeyColumnName
};
