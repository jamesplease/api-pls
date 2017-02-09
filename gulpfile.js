'use strict';

const gulp = require('gulp');
const loadPlugins = require('gulp-load-plugins');
const isparta = require('isparta');

const Instrumenter = isparta.Instrumenter;
const mochaGlobals = require('./test/globals');

// Load all of our Gulp plugins
const $ = loadPlugins();

// Opt in to these files so that `bin`, `node_modules`, and so on, aren't
// picked up.
const entry = './index.js';
const allJsFiles = '{database,server,lib}/**/*.js';
const testFiles = 'test/**/*.js';
const ignoreNodeModules = '!node_modules/**/*';

// Lint a set of files
function lint() {
  return gulp.src([entry, allJsFiles, testFiles, ignoreNodeModules])
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError());
}

function _mocha() {
  return gulp.src([
    './test/setup.js',
    './test/unit/**/*.js',
    './test/integration/setup.js',
    './test/integration/**/*.js'
  ], {read: false})
    .pipe($.mocha({
      reporter: 'dot',
      globals: Object.keys(mochaGlobals.globals),
      ignoreLeaks: false
    }));
}

function test() {
  return _mocha();
}

function coverage(done) {
  gulp.src([entry, allJsFiles])
    .pipe($.istanbul({
      instrumenter: Instrumenter,
      includeUntested: true
    }))
    .pipe($.istanbul.hookRequire())
    .on('finish', () => {
      return test()
        .pipe($.istanbul.writeReports())
        .on('end', done);
    });
}

const watchFiles = [entry, allJsFiles, 'package.json', '**/.eslintrc', ignoreNodeModules];

// Run the headless unit tests as you make changes.
function watch() {
  $.watch(watchFiles, ['test']);
}

// Lint
gulp.task('lint', lint);

// Lint and run our tests
gulp.task('test', ['lint'], test);

// Set up coverage and run tests
gulp.task('coverage', ['lint'], coverage);

// Run the headless unit tests as you make changes.
gulp.task('watch', watch);

// An alias of test
gulp.task('default', ['test']);
