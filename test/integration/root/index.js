const path = require('path');
const request = require('supertest');
const app = require('../../../server/app');
const getDb = require('../../../lib/database');
const wipeDatabase = require('../../../lib/database/wipe');
const validators = require('../../helpers/json-api-validators');
const applyMigrations = require('../../helpers/apply-migrations');

const db = getDb();
const fixturesDirectory = path.join(__dirname, '..', '..', 'fixtures');

describe('The root endpoint', function() {
  // Ensure that the DB connection drops immediately after each test
  afterEach(() => {
    db.$config.pgp.end();
  });

  // Ensure that there's no lingering data between tests by wiping the
  // database before each test.
  beforeEach(done => {
    wipeDatabase(db).then(() => done());
  });

  describe('Root route', () => {
    it('should forward you to the version, if a version is not specified', (done) => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'empty-resources'),
        apiVersion: 5
      };

      applyMigrations(options)
        .then(() => {
          request(app(options))
            .get('/')
            .expect('Location', '/v5')
            .expect(302)
            .end(done);
        });
    });

    it('should return 406 if the invalid Accepts is specified', (done) => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'empty-resources'),
        apiVersion: 1
      };

      const expectedErrors = [{
        title: 'Invalid Accepts Header',
        detail: 'No instances of the JSON API media type in the Accepts header were specified without media type parameters.'
      }];

      applyMigrations(options)
        .then(() => {
          request(app(options))
            .get('/v1')
            .set('Accept', 'sandwiches')
            .expect(validators.basicValidation)
            .expect(validators.assertErrors(expectedErrors))
            .expect(406)
            .end(done);
        });
    });

    it('should return 415 if an invalid Content-Type header is specified', (done) => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'empty-resources'),
        apiVersion: 10
      };

      const expectedErrors = [{
        title: 'Invalid Content-Type Header',
        detail: 'The header "Content-Type: application/vnd.api+json" cannot have media type parameters.'
      }];

      applyMigrations(options)
        .then(() => {
          request(app(options))
            .get('/v10')
            .set('Content-Type', 'application/vnd.api+json; sandwiches=true')
            .expect(validators.basicValidation)
            .expect(validators.assertErrors(expectedErrors))
            .expect(415)
            .end(done);
        });
    });

    it('should return 200, with the proper response, when there are no resources', (done) => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'empty-resources'),
        apiVersion: 500
      };

      const jsonapi = {
        version: '1.0',
        meta: {
          extensions: []
        }
      };

      const meta = {
        api_version: '500'
      };

      const links = {};

      applyMigrations(options)
        .then(() => {
          request(app(options))
            .get('/v500')
            .expect('Content-Type', 'application/json')
            .expect(validators.assertJsonapi(jsonapi))
            .expect(validators.assertMeta(meta))
            .expect(validators.assertLinks(links))
            .expect(200)
            .end(done);
        });
    });

    it('should return 200, with the proper response, when there is one resource', (done) => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'one-resource'),
        apiVersion: 2
      };

      const jsonapi = {
        version: '1.0',
        meta: {
          extensions: []
        }
      };

      const meta = {
        api_version: '2'
      };

      const links = {
        people: {
          href: '/v2/people',
          meta: {
            supported_actions: [
              'read_one',
              'read_many',
              'delete'
            ]
          }
        }
      };

      applyMigrations(options)
        .then(() => {
          request(app(options))
            .get('/v2')
            .expect('Content-Type', 'application/json')
            .expect(validators.assertJsonapi(jsonapi))
            .expect(validators.assertMeta(meta))
            .expect(validators.assertLinks(links))
            .expect(200)
            .end(done);
        });
    });
  });
});
