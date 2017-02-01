'use strict';

const pgp = require('pg-promise')();
const dbConfig = require('../../config/db-config');

module.exports = pgp(dbConfig);
