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
  beforeEach(async () => {
    await wipeDatabase(db);
  });

  describe('when the request succeeds', () => {
    beforeEach((done) => {
      this.options = {
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

      applyMigrations(this.options)
        .then(() => seed('person', personSeeds))
        .then(() => seed('cat', catSeeds))
        .then(() => done());
    });

    it('should return a 200 OK, with the resource', (done) => {
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

      request(app(this.options))
        .get('/v2/cats/1')
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .end(done);
    });
  });
});
