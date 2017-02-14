const path = require('path');
const request = require('supertest');
const app = require('../../../server/app');
const getDb = require('../../../lib/database');
const wipeDatabase = require('../../../lib/wipe-database');
const validators = require('../../helpers/json-api-validators');
const applyMigrations = require('../../helpers/apply-migrations');

const db = getDb();
const fixturesDirectory = path.join(__dirname, '..', '..', 'fixtures');

describe('Resource POST failure', function() {
  // Ensure that the DB connection drops immediately after each test
  afterEach(() => {
    db.$config.pgp.end();
  });

  // Ensure that there's no lingering data between tests by wiping the
  // database before each test.
  beforeEach(done => {
    wipeDatabase(db).then(() => done());
  });

  describe('when the resource does not exist', () => {
    it('should return a Not Found error response', (done) => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'empty-resources'),
        apiVersion: 2
      };

      const expectedErrors = [{
        title: 'Resource Not Found',
        detail: 'The requested resource does not exist.'
      }];

      const expectedLinks = {
        self: '/v2/pastas'
      };

      applyMigrations(options)
        .then(() => {
          request(app(options))
            .post('/v2/pastas')
            .expect(validators.basicValidation)
            .expect(validators.assertErrors(expectedErrors))
            .expect(validators.assertLinks(expectedLinks))
            .expect(404)
            .end(done);
        });
    });
  });

  describe('attempting to POST a single resource', () => {
    it('should return a Method Not Allowed error response', (done) => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 3
      };

      const expectedErrors = [{
        title: 'Method Not Allowed',
        detail: 'This method is not permitted on this resource.'
      }];

      const expectedLinks = {
        self: '/v3/nopes/1'
      };

      applyMigrations(options)
        .then(() => {
          request(app(options))
            .post('/v3/nopes/1')
            .expect(validators.basicValidation)
            .expect(validators.assertErrors(expectedErrors))
            .expect(validators.assertLinks(expectedLinks))
            .expect(405)
            .end(done);
        });
    });
  });

  describe('when the resource does not permit POST', () => {
    it('should return a Not Allowed error response', (done) => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 4
      };

      const expectedErrors = [{
        title: 'Method Not Allowed',
        detail: 'This method is not permitted on this resource.'
      }];

      const expectedLinks = {
        self: '/v4/no-cruds'
      };

      applyMigrations(options)
        .then(() => {
          request(app(options))
            .post('/v4/no-cruds')
            .expect(validators.basicValidation)
            .expect(validators.assertErrors(expectedErrors))
            .expect(validators.assertLinks(expectedLinks))
            .expect(405)
            .end(done);
        });
    });
  });

  describe('when the request does not have a "data" property', () => {
    it('should return a Bad Request error response', (done) => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 1
      };

      const expectedErrors = [{
        title: 'Bad Request',
        detail: '"body" should have required property \'data\''
      }];

      const expectedLinks = {
        self: '/v1/nopes'
      };

      applyMigrations(options)
        .then(() => {
          request(app(options))
            .post('/v1/nopes')
            // The issue is that these aren't nested within `data`.
            .send({
              type: 'nopes',
              attributes: {
                size: 'M'
              }
            })
            .expect(validators.basicValidation)
            .expect(validators.assertErrors(expectedErrors))
            .expect(validators.assertLinks(expectedLinks))
            .expect(400)
            .end(done);
        });
    });
  });

  describe('when non-nullable attributes are not included', () => {
    it('should return a Bad Request error response', (done) => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 5
      };

      const expectedErrors = [{
        title: 'Bad Request',
        detail: '"body.data.attributes" should have required property \'label\''
      }];

      const expectedLinks = {
        self: '/v5/nopes'
      };

      applyMigrations(options)
        .then(() => {
          request(app(options))
            .post('/v5/nopes')
            .send({
              data: {
                type: 'nopes',
                attributes: {
                  size: 'M'
                }
              }
            })
            .expect(validators.basicValidation)
            .expect(validators.assertErrors(expectedErrors))
            .expect(validators.assertLinks(expectedLinks))
            .expect(400)
            .end(done);
        });
    });
  });

  describe('when resource has non-nullable meta, and meta is omitted', () => {
    it('should return a Bad Request error response', (done) => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 5
      };

      const expectedErrors = [{
        title: 'Bad Request',
        detail: '"body.data" should have required property \'meta\''
      }];

      const expectedLinks = {
        self: '/v5/required_metas'
      };

      applyMigrations(options)
        .then(() => {
          request(app(options))
            .post('/v5/required_metas')
            .send({
              data: {
                type: 'required_metas',
                attributes: {
                  first_name: 'james',
                  last_name: 'please'
                }
              }
            })
            .expect(validators.basicValidation)
            .expect(validators.assertErrors(expectedErrors))
            .expect(validators.assertLinks(expectedLinks))
            .expect(400)
            .end(done);
        });
    });
  });

  describe('when non-nullable meta is not included in request', () => {
    it('should return a Bad Request error response', (done) => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 5
      };

      const expectedErrors = [{
        title: 'Bad Request',
        detail: '"body.data.meta" should have required property \'copyright\''
      }];

      const expectedLinks = {
        self: '/v5/required_metas'
      };

      applyMigrations(options)
        .then(() => {
          request(app(options))
            .post('/v5/required_metas')
            .send({
              data: {
                type: 'required_metas',
                attributes: {
                  first_name: 'james',
                  last_name: 'please'
                },
                meta: {}
              }
            })
            .expect(validators.basicValidation)
            .expect(validators.assertErrors(expectedErrors))
            .expect(validators.assertLinks(expectedLinks))
            .expect(400)
            .end(done);
        });
    });
  });

  describe('when non-nullable data and meta is not included', () => {
    it('should return a Bad Request error response', (done) => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 5
      };

      const expectedErrors = [{
        title: 'Bad Request',
        detail: '"body.data.attributes" should have required property \'first_name\''
      }, {
        title: 'Bad Request',
        detail: '"body.data.meta" should have required property \'copyright\''
      }];

      const expectedLinks = {
        self: '/v5/requireds'
      };

      applyMigrations(options)
        .then(() => {
          request(app(options))
            .post('/v5/requireds')
            .send({
              data: {
                type: 'requireds',
                attributes: {
                  last_name: 'please'
                },
                meta: {}
              }
            })
            .expect(validators.basicValidation)
            .expect(validators.assertErrors(expectedErrors))
            .expect(validators.assertLinks(expectedLinks))
            .expect(400)
            .end(done);
        });
    });
  });

  describe('when the request references a nonexistent related resource', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 10
      };

      applyMigrations(this.options)
        .then(() => done());
    });

    it('should return a 500 response', (done) => {
      const expectedLinks = {
        self: '/v10/relations'
      };

      const expectedErrors = [{
        title: 'Server Error',
        detail: 'The server encounted an error while processing your request'
      }];

      request(app(this.options))
        .post('/v10/relations')
        .send({
          data: {
            type: 'relations',
            attributes: {
              name: 'please'
            },
            relationships: {
              owner: {
                data: {
                  id: '1',
                  type: 'paginates'
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
