const path = require('path');
const request = require('supertest');
const app = require('../../../../server/app');
const getDb = require('../../../../lib/database');
const wipeDatabase = require('../../../../lib/database/wipe');
const validators = require('../../../helpers/json-api-validators');
const applyMigrations = require('../../../helpers/apply-migrations');
const seed = require('../../../helpers/seed');

const db = getDb();

describe('Resource GET (many) many-to-one (guest)', function() {
  // Ensure that the DB connection drops immediately after each test
  afterEach(() => {
    db.$config.pgp.end();
  });

  // Ensure that there's no lingering data between tests by wiping the
  // database before each test.
  beforeEach(async () => {
    await wipeDatabase(db);
  });

  describe('when the request succeeds', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(global.fixturesDirectory, 'many-to-one'),
        apiVersion: 5
      };

      const personSeeds = [
        {first_name: 'sandwiches'},
        {first_name: 'what'},
        {first_name: 'pls'}
      ];

      const catSeeds = [
        {name: 'james', owner_id: '2'},
        {name: 'pragya', owner_id: null},
        {name: 'tim', owner_id: '2'},
        {name: 'sammy', owner_id: '3'}
      ];

      applyMigrations(this.options)
        .then(() => seed('person', personSeeds))
        .then(() => seed('cat', catSeeds))
        .then(() => done());
    });

    it('should return a 200 OK, with the resource and links', (done) => {
      const expectedData = [
        {
          type: 'people',
          id: '1',
          attributes: {
            first_name: 'sandwiches',
            last_name: null
          },
          relationships: {
            pets: {
              links: {
                self: '/v5/people/1/relationships/pets'
              }
            }
          }
        },
        {
          type: 'people',
          id: '2',
          attributes: {
            first_name: 'what',
            last_name: null
          },
          relationships: {
            pets: {
              data: [
                {id: '1', type: 'cats'},
                {id: '3', type: 'cats'},
              ],
              links: {
                self: '/v5/people/2/relationships/pets',
                related: '/v5/people/2/pets'
              }
            }
          }
        },
        {
          type: 'people',
          id: '3',
          attributes: {
            first_name: 'pls',
            last_name: null
          },
          relationships: {
            pets: {
              data: [
                {id: '4', type: 'cats'},
              ],
              links: {
                self: '/v5/people/3/relationships/pets',
                related: '/v5/people/3/pets'
              }
            }
          }
        },
      ];

      const expectedMeta = {
        page_number: 1,
        page_size: 10,
        total_count: 3
      };

      const expectedLinks = {
        self: '/v5/people?page[size]=10&sandwiches=tasty',
        first: '/v5/people?page[size]=10&page[number]=1&sandwiches=tasty',
        last: '/v5/people?page[size]=10&page[number]=1&sandwiches=tasty',
        prev: null,
        next: null
      };

      request(app(this.options))
        .get('/v5/people')
        .query('page[size]=10&sandwiches=tasty')
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertMeta(expectedMeta))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .end(done);
    });
  });
});
