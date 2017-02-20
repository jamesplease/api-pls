const path = require('path');
const request = require('supertest');
const app = require('../../../../server/app');
const getDb = require('../../../../lib/database');
const wipeDatabase = require('../../../../lib/database/wipe');
const validators = require('../../../helpers/json-api-validators');
const applyMigrations = require('../../../helpers/apply-migrations');
const seed = require('../../../helpers/seed');

const db = getDb();

describe('Resource POST success, one-to-one (host)', function() {
  // Ensure that the DB connection drops immediately after each test
  afterEach(() => {
    db.$config.pgp.end();
  });

  // Ensure that there's no lingering data between tests by wiping the
  // database before each test.
  beforeEach(done => {
    wipeDatabase(db).then(() => done());
  });

  describe('when the request is valid', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(global.fixturesDirectory, 'one-to-one'),
        apiVersion: 10
      };

      const chipSeeds = [{
        type: 'samsung'
      }];

      applyMigrations(this.options)
        .then(() => seed('chip', chipSeeds))
        .then(() => done());
    });

    it('should return a 200 OK, with the created resource', (done) => {
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

      request(app(this.options))
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
        .end(done);
    });
  });

  describe('when the request violates a one-to-one relationship', () => {
    beforeEach((done) => {
      this.options = {
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

      applyMigrations(this.options)
      .then(() => seed('chip', chipSeeds))
        .then(() => seed('dog', dogSeeds))
        .then(() => done());
    });

    it('should return a 500 response', (done) => {
      const expectedErrors = [{
        title: 'Server Error',
        detail: 'The server encounted an error while processing your request'
      }];

      const expectedLinks = {
        self: '/v10/dogs'
      };

      request(app(this.options))
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
        .end(done);
    });
  });
});
