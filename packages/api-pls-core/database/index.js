'use strict';

const pgp = require('pg-promise')();
const dbConfig = require('./config');

module.exports = pgp(dbConfig);
