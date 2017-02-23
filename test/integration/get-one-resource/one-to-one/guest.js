const path = require('path');
const request = require('supertest');
const app = require('../../../../server/app');
const getDb = require('../../../../lib/database');
const wipeDatabase = require('../../../../lib/database/wipe');
const validators = require('../../../helpers/json-api-validators');
const applyMigrations = require('../../../helpers/apply-migrations');
const seed = require('../../../helpers/seed');

const db = getDb();

describe('Resource GET (one) one-to-one (guest)', function() {
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
    it('should return a 200 OK, with the resource', async () => {
      const options = {
        resourcesDirectory: path.join(global.fixturesDirectory, 'one-to-one'),
        apiVersion: 2
      };

      const chipSeeds = [
        {type: 'samsung'},
        {type: 'cch'},
        {type: 'panasonic'}
      ];

      const dogSeeds = [
        {name: 'peanut', device_id: '2'}
      ];

      const expectedData = {
        type: 'chips',
        id: '2',
        attributes: {
          type: 'cch'
        },
        relationships: {
          host: {
            data: {
              id: '1',
              type: 'dogs'
            },
            links: {
              related: '/v2/chips/2/host',
              self: '/v2/chips/2/relationships/host'
            }
          }
        }
      };

      const expectedLinks = {
        self: '/v2/chips/2'
      };

      await applyMigrations(options);
      await seed('chip', chipSeeds);
      await seed('dog', dogSeeds);
      return request(app(options))
        .get('/v2/chips/2')
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .then();
    });
  });
});
