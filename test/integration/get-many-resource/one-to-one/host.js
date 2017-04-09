const path = require('path');
const request = require('supertest');
const app = require('../../../../packages/api-pls-express-server/app');
const getDb = require('../../../../lib/database');
const wipeDatabase = require('../../../../lib/database/wipe');
const validators = require('../../../helpers/json-api-validators');
const applyMigrations = require('../../../helpers/apply-migrations');
const seed = require('../../../helpers/seed');

const db = getDb();

describe('Resource GET (many) one-to-one (host)', function() {
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
        {name: 'peanut', device_id: '2'},
        {name: 'lester', device_id: null},
        {name: 'gator', device_id: '1'},
      ];

      const expectedData = [
        {
          type: 'dogs',
          id: '1',
          attributes: {
            name: 'peanut',
            size: null
          },
          relationships: {
            device: {
              data: {
                id: '2',
                type: 'chips'
              },
              links: {
                related: '/v2/dogs/1/device',
                self: '/v2/dogs/1/relationships/device'
              }
            }
          }
        },
        {
          type: 'dogs',
          id: '2',
          attributes: {
            name: 'lester',
            size: null
          },
          relationships: {
            device: {
              links: {
                self: '/v2/dogs/2/relationships/device'
              }
            }
          }
        },
        {
          type: 'dogs',
          id: '3',
          attributes: {
            name: 'gator',
            size: null
          },
          relationships: {
            device: {
              data: {
                id: '1',
                type: 'chips'
              },
              links: {
                related: '/v2/dogs/3/device',
                self: '/v2/dogs/3/relationships/device'
              }
            }
          }
        }
      ];

      const expectedLinks = {
        self: '/v2/dogs',
        first: '/v2/dogs?page[number]=1',
        last: '/v2/dogs?page[number]=1',
        prev: null,
        next: null,
      };

      await applyMigrations(options);
      await seed('chip', chipSeeds);
      await seed('dog', dogSeeds);
      return request(app(options))
        .get('/v2/dogs')
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .then();
    });
  });
});
