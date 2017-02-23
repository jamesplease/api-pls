const path = require('path');
const request = require('supertest');
const app = require('../../../server/app');
const getDb = require('../../../lib/database');
const wipeDatabase = require('../../../lib/database/wipe');
const validators = require('../../helpers/json-api-validators');
const applyMigrations = require('../../helpers/apply-migrations');
const seed = require('../../helpers/seed');

const db = getDb();

describe('Resource GET (one) failure', function() {
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
    it('should return a Not Found error response', async () => {
      const options = {
        resourcesDirectory: path.join(global.fixturesDirectory, 'empty-resources'),
        apiVersion: 3
      };

      const expectedErrors = [{
        title: 'Resource Not Found',
        detail: 'The requested resource does not exist.'
      }];

      const expectedLinks = {
        self: '/v3/pastas/1'
      };

      await applyMigrations(options);
      return request(app(options))
        .get('/v3/pastas/1')
        .expect(validators.basicValidation)
        .expect(validators.assertErrors(expectedErrors))
        .expect(validators.assertLinks(expectedLinks))
        .expect(404)
        .then();
    });
  });

  describe('when no valid fields are requested via sparse fields', () => {
    it('should return a Bad Request error response', async () => {
      const options = {
        resourcesDirectory: path.join(global.fixturesDirectory, 'kitchen-sink'),
        apiVersion: 4
      };

      const seeds = [{
        first_name: 'james',
        last_name: 'please'
      }];

      const expectedErrors = [{
        title: 'Bad Request',
        detail: 'No valid fields were specified for resource "no_metas".'
      }];

      const expectedLinks = {
        self: '/v4/no_metas/1?fields[no_metas]=sandwiches'
      };

      await applyMigrations(options);
      await seed('no_meta', seeds);
      return request(app(options))
        .get('/v4/no_metas/1')
        .query('fields[no_metas]=sandwiches')
        .expect(validators.basicValidation)
        .expect(validators.assertErrors(expectedErrors))
        .expect(validators.assertLinks(expectedLinks))
        .expect(400)
        .then();
    });
  });
});
