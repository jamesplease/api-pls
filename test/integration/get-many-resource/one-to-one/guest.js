const path = require('path');
const request = require('supertest');
const app = require('../../../../server/app');
const getDb = require('../../../../lib/database');
const wipeDatabase = require('../../../../lib/database/wipe');
const validators = require('../../../helpers/json-api-validators');
const applyMigrations = require('../../../helpers/apply-migrations');
const seed = require('../../../helpers/seed');

const db = getDb();

describe('Resource GET (many) one-to-one (guest)', function() {
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
        {name: 'peanut', device_id: '2'}
      ];

      applyMigrations(this.options)
        .then(() => seed('chip', chipSeeds))
        .then(() => seed('dog', dogSeeds))
        .then(() => done());
    });

    it('should return a 200 OK, with the resource', (done) => {
      const expectedData = [
        {
          type: 'chips',
          id: '1',
          attributes: {
            type: 'samsung'
          },
          relationships: {
            host: {
              links: {
                self: '/v2/chips/1/relationships/host'
              }
            }
          }
        },
        {
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
        },
        {
          type: 'chips',
          id: '3',
          attributes: {
            type: 'panasonic'
          },
          relationships: {
            host: {
              links: {
                self: '/v2/chips/3/relationships/host'
              }
            }
          }
        },
      ];

      const expectedLinks = {
        self: '/v2/chips',
        first: '/v2/chips?page[number]=1',
        last: '/v2/chips?page[number]=1',
        prev: null,
        next: null,
      };

      request(app(this.options))
        .get('/v2/chips')
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .end(done);
    });
  });
});
