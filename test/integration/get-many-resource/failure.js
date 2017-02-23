const path = require('path');
const request = require('supertest');
const app = require('../../../server/app');
const getDb = require('../../../lib/database');
const wipeDatabase = require('../../../lib/database/wipe');
const validators = require('../../helpers/json-api-validators');
const applyMigrations = require('../../helpers/apply-migrations');
const seed = require('../../helpers/seed');

const db = getDb();
const fixturesDirectory = path.join(__dirname, '..', '..', 'fixtures');

describe('Resource GET (many) failure', function() {
  // Ensure that the DB connection drops immediately after each test
  afterEach(() => {
    db.$config.pgp.end();
  });

  // Ensure that there's no lingering data between tests by wiping the
  // database before each test.
  beforeEach(async () => {
    await wipeDatabase(db);
  });

  describe('when the resource does not exist', () => {
    it('should return a Not Found error response', (done) => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'empty-resources'),
        apiVersion: 1
      };

      const expectedErrors = [{
        title: 'Resource Not Found',
        detail: 'The requested resource does not exist.'
      }];

      const expectedLinks = {
        self: '/v1/pastas'
      };

      applyMigrations(options)
        .then(() => {
          request(app(options))
            .get('/v1/pastas')
            .expect(validators.basicValidation)
            .expect(validators.assertErrors(expectedErrors))
            .expect(validators.assertLinks(expectedLinks))
            .expect(404)
            .end(done);
        });
    });
  });

  describe('when no valid fields are requested via sparse fields', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 3
      };

      const seeds = [{
        first_name: 'james',
        last_name: 'please'
      }];

      applyMigrations(this.options)
        .then(() => seed('no_meta', seeds))
        .then(() => done());
    });

    it('should return a Bad Request error response', (done) => {
      const expectedErrors = [{
        title: 'Bad Request',
        detail: 'No valid fields were specified for resource "no_metas".'
      }];

      const expectedLinks = {
        self: '/v3/no_metas?fields[no_metas]=sandwiches'
      };

      request(app(this.options))
        .get('/v3/no_metas')
        .query('fields[no_metas]=sandwiches')
        .expect(validators.basicValidation)
        .expect(validators.assertErrors(expectedErrors))
        .expect(validators.assertLinks(expectedLinks))
        .expect(400)
        .end(done);
    });
  });

  describe('when the request fails due to out of bounds page size', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 10
      };

      const seeds = [
        {first_name: 'james', last_name: 'please'},
        {first_name: 'shilpa', last_name: 'please'},
        {first_name: 'tim', last_name: 'please'},
        {first_name: 'stephen', last_name: 'please'}
      ];

      applyMigrations(this.options)
        .then(() => seed('paginate', seeds))
        .then(() => done());
    });

    it('should return a 400 response', (done) => {
      const expectedErrors = [
        {
          title: 'Bad Request',
          detail: 'Query parameter "page.size" must be greater than zero.'
        }
      ];

      const expectedLinks = {
        self: '/v10/paginates?page[number]=2&page[size]=0',
      };

      request(app(this.options))
        .get('/v10/paginates')
        .query('page[number]=2&page[size]=0')
        .expect(validators.basicValidation)
        .expect(validators.assertErrors(expectedErrors))
        .expect(validators.assertLinks(expectedLinks))
        .expect(400)
        .end(done);
    });
  });

  describe('when the request fails due to out of bounds page size & number', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 10
      };

      const seeds = [
        {first_name: 'james', last_name: 'please'},
        {first_name: 'shilpa', last_name: 'please'},
        {first_name: 'tim', last_name: 'please'},
        {first_name: 'stephen', last_name: 'please'}
      ];

      applyMigrations(this.options)
        .then(() => seed('paginate', seeds))
        .then(() => done());
    });

    it('should return a 400 response', (done) => {
      const expectedErrors = [
        {
          title: 'Bad Request',
          detail: 'Query parameter "page.number" must be greater than zero.'
        },
        {
          title: 'Bad Request',
          detail: 'Query parameter "page.size" must be greater than zero.'
        }
      ];

      const expectedLinks = {
        self: '/v10/paginates?page[number]=-2&page[size]=0',
      };

      request(app(this.options))
        .get('/v10/paginates')
        .query('page[number]=-2&page[size]=0')
        .expect(validators.basicValidation)
        .expect(validators.assertErrors(expectedErrors))
        .expect(validators.assertLinks(expectedLinks))
        .expect(400)
        .end(done);
    });
  });
});
