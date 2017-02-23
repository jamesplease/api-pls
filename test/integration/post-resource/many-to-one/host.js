const path = require('path');
const request = require('supertest');
const app = require('../../../../server/app');
const getDb = require('../../../../lib/database');
const wipeDatabase = require('../../../../lib/database/wipe');
const validators = require('../../../helpers/json-api-validators');
const applyMigrations = require('../../../helpers/apply-migrations');
const seed = require('../../../helpers/seed');

const db = getDb();

describe('Resource POST success, many-to-one (host)', function() {
  // Ensure that the DB connection drops immediately after each test
  afterEach(() => {
    db.$config.pgp.end();
  });

  // Ensure that there's no lingering data between tests by wiping the
  // database before each test.
  beforeEach(() => {
    return wipeDatabase(db);
  });

  describe('when the request is valid', () => {
    it('should return a 200 OK, with the created resource', async () => {
      const options = {
        resourcesDirectory: path.join(global.fixturesDirectory, 'many-to-one'),
        apiVersion: 10
      };

      const personSeeds = [{
        first_name: 'sandwiches'
      }];

      const expectedData = {
        type: 'cats',
        id: '1',
        attributes: {
          name: 'please'
        },
        relationships: {
          owner: {
            data: {
              id: '1',
              type: 'people'
            },
            links: {
              self: '/v10/cats/1/relationships/owner',
              related: '/v10/cats/1/owner'
            }
          }
        }
      };

      const expectedLinks = {
        self: '/v10/cats/1'
      };

      await applyMigrations(options);
      await seed('person', personSeeds);
      return request(app(options))
        .post('/v10/cats')
        .send({
          data: {
            type: 'cats',
            attributes: {
              name: 'please'
            },
            relationships: {
              owner: {
                data: {
                  id: '1',
                  type: 'people'
                }
              }
            }
          }
        })
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertLinks(expectedLinks))
        .expect('Location', '/v10/cats/1')
        .expect(201)
        .then();
    });
  });

  describe('when the request references a nonexistent related resource', () => {
    it('should return a 500 response', async () => {
      const options = {
        resourcesDirectory: path.join(global.fixturesDirectory, 'many-to-one'),
        apiVersion: 10
      };

      const expectedLinks = {
        self: '/v10/cats'
      };

      const expectedErrors = [{
        title: 'Server Error',
        detail: 'The server encounted an error while processing your request'
      }];

      await applyMigrations(options);
      return request(app(options))
        .post('/v10/cats')
        .send({
          data: {
            type: 'cats',
            attributes: {
              name: 'please'
            },
            relationships: {
              owner: {
                data: {
                  id: '1',
                  type: 'person'
                }
              }
            }
          }
        })
        .expect(validators.basicValidation)
        .expect(validators.assertErrors(expectedErrors))
        .expect(validators.assertLinks(expectedLinks))
        .expect(500)
        .then();
    });
  });
});
