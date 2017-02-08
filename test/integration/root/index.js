const path = require('path');
const request = require('supertest');
const app = require('../../../server/app');
const getDb = require('../../../database');
const wipeDatabase = require('../../../lib/wipe-database');
const validators = require('../../helpers/json-api-validators');

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
        resourcesDirectory: path.join(fixturesDirectory, 'empty-resources')
      };

      request(app(options))
        .get('/')
        .expect('Location', '/v1')
        .expect(302)
        .end(done);
    });

    it('should return 406 if the invalid Accepts is specified', (done) => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'empty-resources')
      };

      const expectedErrors = [{
        title: 'Invalid Accepts Header',
        detail: 'No instances of the JSON API media type in the Accepts header were specified without media type parameters.'
      }];

      request(app(options))
        .get('/v1')
        .set('Accept', 'sandwiches')
        .expect(validators.basicValidation)
        .expect(validators.assertErrors(expectedErrors))
        .expect(406)
        .end(done);
    });

    it('should return 200, with the proper response, when there are no resources', (done) => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'empty-resources')
      };

      const jsonapi = {
        version: '1.0',
        meta: {
          extensions: []
        }
      };

      const meta = {
        api_version: '1'
      };

      const links = {};

      request(app(options))
        .get('/v1')
        .expect('Content-Type', 'application/json')
        .expect(validators.assertJsonapi(jsonapi))
        .expect(validators.assertMeta(meta))
        .expect(validators.assertLinks(links))
        .expect(200)
        .end(done);
    });

    it('should return 200, with the proper response, when there is one resource', (done) => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'one-resource')
      };

      const jsonapi = {
        version: '1.0',
        meta: {
          extensions: []
        }
      };

      const meta = {
        api_version: '1'
      };

      const links = {
        people: {
          link: '/v1/people',
          meta: {
            methods: [
              'readOne',
              'readMany',
              'delete'
            ]
          }
        }
      };

      request(app(options))
        .get('/v1')
        .expect('Content-Type', 'application/json')
        .expect(validators.assertJsonapi(jsonapi))
        .expect(validators.assertMeta(meta))
        .expect(validators.assertLinks(links))
        .expect(200)
        .end(done);
    });
  });
});
