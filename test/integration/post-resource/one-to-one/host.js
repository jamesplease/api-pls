const path = require('path');
const request = require('supertest');
const app = require('../../../../server/app');
const getDb = require('../../../../lib/database');
const wipeDatabase = require('../../../../lib/database/wipe');
const validators = require('../../../helpers/json-api-validators');
const applyMigrations = require('../../../helpers/apply-migrations');
const seed = require('../../../helpers/seed');

const db = getDb();

describe('Resource POST, one-to-one (host)', function() {
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
        resourcesDirectory: path.join(global.fixturesDirectory, 'one-to-one'),
        apiVersion: 10
      };

      const chipSeeds = [{
        type: 'samsung'
      }];

      const expectedData = {
        type: 'dogs',
        id: '1',
        attributes: {
          name: 'please',
          size: null
        },
        relationships: {
          device: {
            data: {
              id: '1',
              type: 'chips'
            },
            links: {
              self: '/v10/dogs/1/relationships/device',
              related: '/v10/dogs/1/device'
            }
          }
        }
      };

      const expectedLinks = {
        self: '/v10/dogs/1'
      };

      await applyMigrations(options);
      await seed('chip', chipSeeds);
      return request(app(options))
        .post('/v10/dogs')
        .send({
          data: {
            type: 'dogs',
            attributes: {
              name: 'please'
            },
            relationships: {
              device: {
                data: {
                  id: '1',
                  type: 'chips'
                }
              }
            }
          }
        })
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertLinks(expectedLinks))
        .expect('Location', '/v10/dogs/1')
        .expect(201)
        .then();
    });
  });

  describe('when the request violates a one-to-one relationship', () => {
    it('should return a 500 response', async () => {
      const options = {
        resourcesDirectory: path.join(global.fixturesDirectory, 'one-to-one'),
        apiVersion: 10
      };

      const chipSeeds = [{
        type: 'fancy'
      }];

      const dogSeeds = [{
        name: 'ok',
        device_id: '1'
      }];

      const expectedErrors = [{
        title: 'Server Error',
        detail: 'The server encounted an error while processing your request'
      }];

      const expectedLinks = {
        self: '/v10/dogs'
      };

      await applyMigrations(options);
      await seed('chip', chipSeeds);
      await seed('dog', dogSeeds);
      return request(app(options))
        .post('/v10/dogs')
        .send({
          data: {
            type: 'dogs',
            attributes: {
              name: 'please'
            },
            relationships: {
              device: {
                data: {
                  id: '1',
                  type: 'chips'
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
