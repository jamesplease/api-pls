'use strict';

const pgp = require('pg-promise');
const sqlUtil = require('./sql-util');

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

function buildAssociativeTable({relationship, definition}) {
  const guest = relationship.relatedDefinition;
  const host = definition;

  const tableName = getAssociativeTableName({host, guest, escaped: true});
  const hostIdColumnName = getHostIdColumnName({host, escaped: true});
  const guestIdColumnName = getGuestIdColumnName({guest, escaped: true});
  const primaryKeyColumnName = getPrimaryKeyColumnName({host, guest, escaped: true});
  const hostTableName = sqlUtil.getTableName(host, {escaped: true});
  const guestTableName = sqlUtil.getTableName(guest, {escaped: true});
  const hostTableIdColumnName = sqlUtil.getIdColumnFromResource(host, {escaped: true});
  const guestTableIdColumnName = sqlUtil.getIdColumnFromResource(guest, {escaped: true});

  return `CREATE TABLE ${tableName} (
    ${hostIdColumnName} int REFERENCES ${hostTableName} (${hostTableIdColumnName}) ON UPDATE CASCADE ON DELETE CASCADE,
    ${guestIdColumnName} int REFERENCES ${guestTableName} (${guestTableIdColumnName}) ON UPDATE CASCADE,
    CONSTRAINT ${primaryKeyColumnName} PRIMARY KEY (${hostIdColumnName}, ${guestIdColumnName})
  );`;
}

module.exports = {
  getAssociativeTableName, getHostIdColumnName, getGuestIdColumnName,
  getPrimaryKeyColumnName, buildAssociativeTable
};
