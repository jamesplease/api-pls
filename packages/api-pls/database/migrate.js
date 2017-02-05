'use strict';

// This can apply and tear down our migrations.
// This is a shim until https://github.com/programble/careen/issues/1 is
// resolved

const exec = require('child_process').execSync;
const path = require('path');

const configPath = path.resolve(__dirname, 'careen.js');

const migrator = path.resolve(
  __dirname,
  '..',
  'node_modules',
  '.bin',
  'careen'
);

function execute(command) {
  exec(`${migrator} -c "${configPath}" ${command}`);
}

// Run all of the migrations
exports.up = execute.bind(null, '-A -e');

// Tear all of the migrations down
exports.reset = function() {
  execute('-R -a -e --to=20150823131441');
  execute('-A -e');
};
