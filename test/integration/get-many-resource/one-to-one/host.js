const path = require('path');
const request = require('supertest');
const app = require('../../../../server/app');
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
  beforeEach(done => {
    wipeDatabase(db).then(() => done());
  });

  describe('when the request succeeds', () => {
    beforeEach((done) => {
      this.options = {
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

      applyMigrations(this.options)
        .then(() => seed('chip', chipSeeds))
        .then(() => seed('dog', dogSeeds))
        .then(() => done());
    });

    it('should return a 200 OK, with the resource', (done) => {
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

      request(app(this.options))
        .get('/v2/dogs')
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .end(done);
    });
  });
});
