const path = require('path');
const request = require('supertest');
const app = require('../../../server/app');
const getDb = require('../../../lib/database');
const seed = require('../../helpers/seed');
const wipeDatabase = require('../../../lib/wipe-database');
const validators = require('../../helpers/json-api-validators');
const applyMigrations = require('../../helpers/apply-migrations');

const db = getDb();
const fixturesDirectory = path.join(__dirname, '..', '..', 'fixtures');

describe('Resource DELETE', function() {
  // Ensure that the DB connection drops immediately after each test
  afterEach(() => {
    db.$config.pgp.end();
  });

  // Ensure that there's no lingering data between tests by wiping the
  // database before each test.
  beforeEach(done => {
    wipeDatabase(db).then(() => done());
  });

  describe('when the resource does not exist', () => {
    it('should return a Not Found error response', (done) => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'empty-resources')
      };

      const expectedErrors = [{
        title: 'Resource Not Found',
        detail: 'The requested resource does not exist.'
      }];

      applyMigrations(options)
        .then(() => {
          request(app(options))
            .delete('/v1/pastas/1')
            .expect(validators.basicValidation)
            .expect(validators.assertErrors(expectedErrors))
            .expect(404)
            .end(done);
        });
    });
  });

  describe('attempting to DELETE an entire list of resources', () => {
    it('should return a Method Not Allowed error response', (done) => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink')
      };

      const expectedErrors = [{
        title: 'Method Not Allowed',
        detail: 'This method is not permitted on this resource.'
      }];

      applyMigrations(options)
        .then(() => {
          request(app(options))
            .delete('/v1/nopes')
            .expect(validators.basicValidation)
            .expect(validators.assertErrors(expectedErrors))
            .expect(405)
            .end(done);
        });
    });
  });

  describe('when the request succeeds', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink')
      };

      const seeds = [{
        label: 'sandwiches',
        size: 'M'
      }];

      applyMigrations(this.options)
        .then(() => seed('nope', seeds))
        .then(() => done());
    });

    it('should return a 204 response', (done) => {
      request(app(this.options))
        .delete('/v1/nopes/1')
        .expect(validators.assertEmptyBody)
        .expect(204)
        .end(done);
    });
  });
});
