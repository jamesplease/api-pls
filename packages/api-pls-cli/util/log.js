'use strict';

const chalk = require('chalk');
const pino = require('pino');

// This maps a pino log level to a colored output
const levelMap = {
  35: 'green',
  40: 'red',
  50: 'red',
  60: 'red'
};

// This is the list of the keys that pino provides to "val" in the formatter
const standardKeys = ['pid', 'hostname', 'name', 'level', 'time', 'v', 'msg'];

// This method is pulled from the pino `pretty` source directly
function withSpaces(value) {
  var lines = value.split('\n');
  for (var i = 1; i < lines.length; i++) {
    lines[i] = `    ${lines[i]}`;
  }
  return lines.join('\n');
}

// This method is also pulled from the pino `pretty` source directly
function filter(value) {
  var keys = Object.keys(value);
  var result = '';

  for (var i = 0; i < keys.length; i++) {
    if (standardKeys.indexOf(keys[i]) < 0) {
      result += `   ${keys[i]}: ${withSpaces(JSON.stringify(value[keys[i]], null, 2))}\n`;
    }
  }

  return result;
}

// This formats what the user inputs
function formatter(val) {
  const chalkMethod = levelMap[val.level];
  let result = [];
  if (val.msg && val.msg !== 'undefined') {
    const msg = chalkMethod ? chalk[chalkMethod](val.msg) : val.msg;
    result.push(msg);
  }
  const additionalData = filter(val);
  if (additionalData) {
    result.push(`${additionalData}`);
  }

  return result.join('\n');
}

const log = pino({
  name: 'api-pls-cli',
  safe: true,
  prettyPrint: {formatter},
  level: 'info'
});

log.addLevel('success', 35);

module.exports = log;
