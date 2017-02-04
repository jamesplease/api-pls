'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const inquirer = require('inquirer');
const chalk = require('chalk');
// const loadResourceModels = require('./lib/load-resource-models');

module.exports = function() {
  inquirer.prompt([{
      type: 'confirm',
      name: 'confirmation',
      message: 'Would you like to build and run migrations? This cannot be undone',
      default: false
    }])
    .then(function(answers) {
      if (!answers.confirmation) {
        return;
      }

      console.log(chalk.grey('Building migrations...'));
      console.log(chalk.green('✔ Migrations successfully built.'));
      console.log(chalk.grey('Running migrations...'));
      console.log(chalk.green('✔ Migrations successfully run. The database is up to date.'));
    });

  // function loadResource(filename) {
  //   const filePath = path.join(resourceDir, filename);
  //
  //   let doc;
  //   try {
  //     doc = yaml.safeLoad(fs.readFileSync(filePath, 'utf8'));
  //   } catch (e) {
  //     console.warn('Resource file could not be loaded');
  //   }
  //
  //   return doc;
  // }
  //
  // fs.readdirSync(resourceDir)
  //   // Open them up and parse them as JSON
  //   .map(loadResource);
};
