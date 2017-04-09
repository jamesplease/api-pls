const path = require('path');
const request = require('supertest');
const app = require('../../../packages/api-pls-express-server/app');
const getDb = require('../../../lib/database');
const wipeDatabase = require('../../../lib/database/wipe');
const validators = require('../../helpers/json-api-validators');
const applyMigrations = require('../../helpers/apply-migrations');

const db = getDb();

describe('The root endpoint', function() {
  // Ensure that the DB connection drops immediately after each test
  afterEach(() => {
    db.$config.pgp.end();
  });

  // Ensure that there's no lingering data between tests by wiping the
  // database before each test.
  beforeEach(() => {
    return wipeDatabase(db);
  });

  describe('Root route', () => {
    it('should forward you to the version, if a version is not specified', async () => {
      const options = {
        resourcesDirectory: path.join(global.fixturesDirectory, 'empty-resources'),
        apiVersion: 5
      };

      await applyMigrations(options);
      return request(app(options))
        .get('/')
        .expect('Location', '/v5')
        .expect(302)
        .then();
    });

    it('should return 406 if the invalid Accepts is specified', async () => {
      const options = {
        resourcesDirectory: path.join(global.fixturesDirectory, 'empty-resources'),
        apiVersion: 1
      };

      const expectedErrors = [{
        title: 'Invalid Accepts Header',
        detail: 'No instances of the JSON API media type in the Accepts header were specified without media type parameters.'
      }];

      await applyMigrations(options);
      return request(app(options))
        .get('/v1')
        .set('Accept', 'sandwiches')
        .expect(validators.basicValidation)
        .expect(validators.assertErrors(expectedErrors))
        .expect(406)
        .then();
    });

    it('should return 415 if an invalid Content-Type header is specified', async () => {
      const options = {
        resourcesDirectory: path.join(global.fixturesDirectory, 'empty-resources'),
        apiVersion: 10
      };

      const expectedErrors = [{
        title: 'Invalid Content-Type Header',
        detail: 'The header "Content-Type: application/vnd.api+json" cannot have media type parameters.'
      }];

      await applyMigrations(options);
      return request(app(options))
        .get('/v10')
        .set('Content-Type', 'application/vnd.api+json; sandwiches=true')
        .expect(validators.basicValidation)
        .expect(validators.assertErrors(expectedErrors))
        .expect(415)
        .then();
    });

    it('should return 200, with the proper response, when there are no resources', async () => {
      const options = {
        resourcesDirectory: path.join(global.fixturesDirectory, 'empty-resources'),
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

      await applyMigrations(options);
      return request(app(options))
        .get('/v500')
        .expect('Content-Type', 'application/json')
        .expect(validators.assertJsonapi(jsonapi))
        .expect(validators.assertMeta(meta))
        .expect(validators.assertLinks(links))
        .expect(200)
        .then();
    });

    it('should return 200, with the proper response, when there is one resource', async () => {
      const options = {
        resourcesDirectory: path.join(global.fixturesDirectory, 'one-resource'),
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

      await applyMigrations(options);
      return request(app(options))
        .get('/v2')
        .expect('Content-Type', 'application/json')
        .expect(validators.assertJsonapi(jsonapi))
        .expect(validators.assertMeta(meta))
        .expect(validators.assertLinks(links))
        .expect(200)
        .then();
    });
  });
});
