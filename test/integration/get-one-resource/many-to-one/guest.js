const path = require('path');
const request = require('supertest');
const app = require('../../../../server/app');
const getDb = require('../../../../lib/database');
const wipeDatabase = require('../../../../lib/database/wipe');
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
  beforeEach(done => {
    wipeDatabase(db).then(() => done());
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
        {name: 'james', owner_id: '1'},
        {name: 'hungry', owner_id: '3'},
        {name: 'pizza', owner_id: '1'},
        {name: 'sammy', owner_id: '2'},
        {name: 'meow', owner_id: '1'},
      ];

      applyMigrations(this.options)
        .then(() => seed('person', personSeeds))
        .then(() => seed('cat', catSeeds))
        .then(() => done());
    });

    it('should return a 200 OK, with the resource and its related items', (done) => {
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
              {id: '1', type: 'cat'},
              {id: '3', type: 'cat'},
              {id: '5', type: 'cat'},
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

      request(app(this.options))
        .get('/v2/people/1')
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .end(done);
    });
  });
});
