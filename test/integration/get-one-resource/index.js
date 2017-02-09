const path = require('path');
const request = require('supertest');
const app = require('../../../server/app');
const getDb = require('../../../lib/database');
const wipeDatabase = require('../../../lib/wipe-database');
const validators = require('../../helpers/json-api-validators');
const applyMigrations = require('../../helpers/apply-migrations');
const seed = require('../../helpers/seed');

const db = getDb();
const fixturesDirectory = path.join(__dirname, '..', '..', 'fixtures');

describe('Resource GET (one)', function() {
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
            .get('/v1/pastas/1')
            .expect(validators.basicValidation)
            .expect(validators.assertErrors(expectedErrors))
            .expect(404)
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
        first_name: 'james',
        last_name: 'please'
      }];

      applyMigrations(this.options)
        .then(() => seed('no_meta', seeds))
        .then(() => done());
    });

    it('should return a 200 response', (done) => {
      const expectedData = {
        type: 'no_metas',
        id: '1',
        attributes: {
          first_name: 'james',
          last_name: 'please'
        }
      };

      request(app(this.options))
        .get('/v1/no_metas/1')
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(200)
        .end(done);
    });
  });

  describe('when no valid fields are requested via sparse fields', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink')
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

      request(app(this.options))
        .get('/v1/no_metas/1')
        .query('fields[no_metas]=sandwiches')
        .expect(validators.basicValidation)
        .expect(validators.assertErrors(expectedErrors))
        .expect(400)
        .end(done);
    });
  });

  describe('when an empty sparse fieldsets param is specified', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink')
      };

      const seeds = [{
        first_name: 'james',
        last_name: 'please'
      }];

      applyMigrations(this.options)
        .then(() => seed('no_meta', seeds))
        .then(() => done());
    });

    it('should return a 200 response with all fields', (done) => {
      const expectedData = {
        type: 'no_metas',
        id: '1',
        attributes: {
          first_name: 'james',
          last_name: 'please'
        }
      };

      request(app(this.options))
        .get('/v1/no_metas/1')
        .query('fields[no_metas]')
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(200)
        .end(done);
    });
  });

  describe('when the request succeeds with sparse fieldsets', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink')
      };

      const seeds = [{
        first_name: 'james',
        last_name: 'please'
      }];

      applyMigrations(this.options)
        .then(() => seed('no_meta', seeds))
        .then(() => done());
    });

    it('should return a 200 response', (done) => {
      const expectedData = {
        type: 'no_metas',
        id: '1',
        attributes: {
          first_name: 'james',
        }
      };

      request(app(this.options))
        .get('/v1/no_metas/1')
        .query('fields[no_metas]=first_name')
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(200)
        .end(done);
    });
  });
});
