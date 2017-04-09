const path = require('path');
const request = require('supertest');
const app = require('../../../../packages/api-pls-express-server/app');
const getDb = require('../../../../packages/api-pls-postgres-adapter/database');
const wipeDatabase = require('../../../../packages/api-pls-postgres-adapter/database/wipe');
const validators = require('../../../helpers/json-api-validators');
const applyMigrations = require('../../../helpers/apply-migrations');
const seed = require('../../../helpers/seed');

const db = getDb();

describe('Resource GET (one) many-to-one (guest)', function() {
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
    it('should return a 200 OK, with the resource and its related items', async () => {
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
        {name: 'james', owner_id: '1'},
        {name: 'hungry', owner_id: '3'},
        {name: 'pizza', owner_id: '1'},
        {name: 'sammy', owner_id: '2'},
        {name: 'meow', owner_id: '1'},
      ];

      const expectedData = {
        type: 'people',
        id: '1',
        attributes: {
          first_name: 'sandwiches',
          last_name: null
        },
        relationships: {
          pets: {
            data: [
              {id: '1', type: 'cats'},
              {id: '3', type: 'cats'},
              {id: '5', type: 'cats'},
            ],
            links: {
              self: '/v2/people/1/relationships/pets',
              related: '/v2/people/1/pets'
            }
          }
        }
      };

      const expectedLinks = {
        self: '/v2/people/1',
      };

      await applyMigrations(options);
      await seed('person', personSeeds);
      await seed('cat', catSeeds);
      return request(app(options))
        .get('/v2/people/1')
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .then();
    });
  });
});
