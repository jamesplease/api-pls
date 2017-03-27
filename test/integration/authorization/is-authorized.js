const path = require('path');
const request = require('supertest');
const app = require('../../../server/app');
const getDb = require('../../../lib/database');
const wipeDatabase = require('../../../lib/database/wipe');
const validators = require('../../helpers/json-api-validators');
const applyMigrations = require('../../helpers/apply-migrations');
const seed = require('../../helpers/seed');

const db = getDb();

describe('is_authorized', function() {
  // Ensure that the DB connection drops immediately after each test
  afterEach(() => {
    db.$config.pgp.end();
  });

  // Ensure that there's no lingering data between tests by wiping the
  // database before each test.
  beforeEach(() => {
    return wipeDatabase(db);
  });

  describe('when the requester is unauthorized', () => {
    it('should return a 401 response', async () => {
      const options = {
        resourcesDirectory: path.join(global.fixturesDirectory, 'authorization'),
        apiVersion: 10
      };

      const seeds = [{
        first_name: 'james',
        last_name: 'please'
      }];

      const expectedErrors = [{
        title: 'Unauthorized',
        detail: 'You are not authorized to perform this action.'
      }];

      const expectedLinks = {
        self: '/v10/cats/1'
      };

      await applyMigrations(options);
      await seed('cat', seeds);
      return request(app(options))
        .get('/v10/cats/1')
        .expect(validators.basicValidation)
        .expect(validators.assertErrors(expectedErrors))
        .expect(validators.assertLinks(expectedLinks))
        .expect(401)
        .then();
    });
  });

  describe('when the requester is authorized', () => {
    it('should return a 200 response', async () => {
      const options = {
        resourcesDirectory: path.join(global.fixturesDirectory, 'authorization'),
        apiVersion: 10
      };

      const seeds = [{
        first_name: 'james',
        last_name: 'please'
      }];

      const expectedData = [{
        type: 'cats',
        id: '1',
        attributes: {
          first_name: 'james',
          last_name: 'please'
        }
      }];

      const expectedLinks = {
        self: '/v10/cats',
        first: '/v10/cats?page[number]=1',
        last: '/v10/cats?page[number]=1',
        next: null,
        prev: null,
      };

      await applyMigrations(options);
      await seed('cat', seeds);
      return request(app(options))
        .get('/v10/cats')
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .then();
    });
  });
});
