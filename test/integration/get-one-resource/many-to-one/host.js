const path = require('path');
const request = require('supertest');
const app = require('../../../../server/app');
const getDb = require('../../../../lib/database');
const wipeDatabase = require('../../../../lib/database/wipe');
const validators = require('../../../helpers/json-api-validators');
const applyMigrations = require('../../../helpers/apply-migrations');
const seed = require('../../../helpers/seed');

const db = getDb();

describe('Resource GET (one) many-to-one (host)', function() {
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
        resourcesDirectory: path.join(global.fixturesDirectory, 'many-to-one'),
        apiVersion: 2
      };

      const personSeeds = [
        {first_name: 'sandwiches'},
        {first_name: 'what'},
        {first_name: 'pls'}
      ];

      const catSeeds = [
        {name: 'james', owner_id: '1'}
      ];

      const expectedData = {
        type: 'cats',
        id: '1',
        attributes: {
          name: 'james'
        },
        relationships: {
          owner: {
            data: {
              id: '1',
              type: 'people'
            },
            links: {
              related: '/v2/cats/1/owner',
              self: '/v2/cats/1/relationships/owner'
            }
          }
        }
      };

      const expectedLinks = {
        self: '/v2/cats/1'
      };

      await applyMigrations(options);
      await seed('person', personSeeds);
      await seed('cat', catSeeds);
      request(app(options))
        .get('/v2/cats/1')
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .then();
    });
  });
});
