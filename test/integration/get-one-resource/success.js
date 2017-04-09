const path = require('path');
const request = require('supertest');
const app = require('../../../packages/api-pls-express-server/app');
const getDb = require('../../../packages/api-pls-postgres-adapter/database');
const wipeDatabase = require('../../../packages/api-pls-postgres-adapter/database/wipe');
const validators = require('../../helpers/json-api-validators');
const applyMigrations = require('../../helpers/apply-migrations');
const seed = require('../../helpers/seed');

const db = getDb();

describe('Resource GET (one) success', function() {
  // Ensure that the DB connection drops immediately after each test
  afterEach(() => {
    db.$config.pgp.end();
  });

  // Ensure that there's no lingering data between tests by wiping the
  // database before each test.
  beforeEach(() => {
    return wipeDatabase(db);
  });

  describe('when the request succeeds', () => {
    it('should return a 200 response', async () => {
      const options = {
        resourcesDirectory: path.join(global.fixturesDirectory, 'kitchen-sink'),
        apiVersion: 10
      };

      const seeds = [{
        first_name: 'james',
        last_name: 'please'
      }];

      const expectedData = {
        type: 'no_metas',
        id: '1',
        attributes: {
          first_name: 'james',
          last_name: 'please'
        }
      };

      const expectedLinks = {
        self: '/v10/no_metas/1'
      };

      await applyMigrations(options);
      await seed('no_meta', seeds);
      return request(app(options))
        .get('/v10/no_metas/1')
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .then();
    });
  });

  describe('when an empty sparse fieldsets param is specified', () => {
    it('should return a 200 response with all fields', async () => {
      const options = {
        resourcesDirectory: path.join(global.fixturesDirectory, 'kitchen-sink'),
        apiVersion: 16
      };

      const seeds = [{
        first_name: 'james',
        last_name: 'please'
      }];

      const expectedData = {
        type: 'no_metas',
        id: '1',
        attributes: {
          first_name: 'james',
          last_name: 'please'
        }
      };

      const expectedLinks = {
        self: '/v16/no_metas/1?fields[no_metas]'
      };

      await applyMigrations(options);
      await seed('no_meta', seeds);
      return request(app(options))
        .get('/v16/no_metas/1')
        .query('fields[no_metas]')
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .then();
    });
  });

  describe('when the request succeeds with sparse fieldsets', () => {
    it('should return a 200 response', async () => {
      const options = {
        resourcesDirectory: path.join(global.fixturesDirectory, 'kitchen-sink'),
        apiVersion: 1
      };

      const seeds = [{
        first_name: 'james',
        last_name: 'please'
      }];

      const expectedData = {
        type: 'no_metas',
        id: '1',
        attributes: {
          first_name: 'james',
        }
      };

      const expectedLinks = {
        self: '/v1/no_metas/1?fields[no_metas]=first_name'
      };

      await applyMigrations(options);
      await seed('no_meta', seeds);
      return request(app(options))
        .get('/v1/no_metas/1')
        .query('fields[no_metas]=first_name')
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .then();
    });
  });
});
