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
  beforeEach(done => {
    wipeDatabase(db).then(() => done());
  });

  describe('when the request is valid', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(global.fixturesDirectory, 'many-to-one'),
        apiVersion: 10
      };

      const personSeeds = [{
        first_name: 'sandwiches'
      }];

      applyMigrations(this.options)
        .then(() => seed('person', personSeeds))
        .then(() => done());
    });

    it('should return a 200 OK, with the created resource', (done) => {
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

      request(app(this.options))
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
        .end(done);
    });
  });

  describe('when the request references a nonexistent related resource', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(global.fixturesDirectory, 'many-to-one'),
        apiVersion: 10
      };

      applyMigrations(this.options)
        .then(() => done());
    });

    it('should return a 500 response', (done) => {
      const expectedLinks = {
        self: '/v10/cats'
      };

      const expectedErrors = [{
        title: 'Server Error',
        detail: 'The server encounted an error while processing your request'
      }];

      request(app(this.options))
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
        .end(done);
    });
  });
});
