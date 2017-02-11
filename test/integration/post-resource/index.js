const path = require('path');
const request = require('supertest');
const app = require('../../../server/app');
const getDb = require('../../../lib/database');
const wipeDatabase = require('../../../lib/wipe-database');
const validators = require('../../helpers/json-api-validators');
const applyMigrations = require('../../helpers/apply-migrations');
const seed = require('../../helpers/seed');

const db = getDb();
const fixturesDirectory = path.join(__dirname, '..', '..', 'fixtures');

describe('Resource POST', function() {
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
        resourcesDirectory: path.join(fixturesDirectory, 'empty-resources')
      };

      const expectedErrors = [{
        title: 'Resource Not Found',
        detail: 'The requested resource does not exist.'
      }];

      const expectedLinks = {
        self: '/v1/pastas'
      };

      applyMigrations(options)
        .then(() => {
          request(app(options))
            .post('/v1/pastas')
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
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink')
      };

      const expectedErrors = [{
        title: 'Method Not Allowed',
        detail: 'This method is not permitted on this resource.'
      }];

      const expectedLinks = {
        self: '/v1/nopes/1'
      };

      applyMigrations(options)
        .then(() => {
          request(app(options))
            .post('/v1/nopes/1')
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
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink')
      };

      const expectedErrors = [{
        title: 'Method Not Allowed',
        detail: 'This method is not permitted on this resource.'
      }];

      const expectedLinks = {
        self: '/v1/no-cruds'
      };

      applyMigrations(options)
        .then(() => {
          request(app(options))
            .post('/v1/no-cruds')
            .expect(validators.basicValidation)
            .expect(validators.assertErrors(expectedErrors))
            .expect(validators.assertLinks(expectedLinks))
            .expect(405)
            .end(done);
        });
    });
  });

  describe('when the request does not adhere to JSON API', () => {
    it('should return a No Valid Fields error response', (done) => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink')
      };

      const expectedErrors = [{
        title: 'Bad Request',
        detail: 'No valid fields were specified for resource "nopes".'
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

  describe('when non-nullable fields are not included', () => {
    it('should return a Bad Request error response', (done) => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink')
      };

      const expectedErrors = [{
        title: 'Bad Request',
        detail: '"body.data.attributes" should have required property \'label\''
      }];

      const expectedLinks = {
        self: '/v1/nopes'
      };

      applyMigrations(options)
        .then(() => {
          request(app(options))
            .post('/v1/nopes')
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

  describe('when the request is valid', () => {
    it('should return a 200 OK, with the created resource', (done) => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink')
      };

      const expectedData = {
        type: 'nopes',
        id: '1',
        attributes: {
          label: 'sandwiches',
          size: 'M'
        },
        meta: {
          updated_at: null
        }
      };

      const expectedLinks = {
        self: '/v1/nopes/1'
      };

      applyMigrations(options)
        .then(() => {
          request(app(options))
            .post('/v1/nopes')
            .send({
              data: {
                type: 'nopes',
                attributes: {
                  label: 'sandwiches',
                  size: 'M'
                }
              }
            })
            .expect(validators.basicValidation)
            .expect(validators.assertData(expectedData))
            .expect(validators.assertLinks(expectedLinks))
            .expect(201)
            .end(done);
        });
    });
  });

  describe('when the request is valid, but has extraneous fields', () => {
    it('should return a 200 OK, with the created resource', (done) => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink')
      };

      const expectedData = {
        type: 'nopes',
        id: '1',
        attributes: {
          label: 'sandwiches',
          size: 'M'
        },
        meta: {
          updated_at: null
        }
      };

      const expectedLinks = {
        self: '/v1/nopes/1'
      };

      applyMigrations(options)
        .then(() => {
          request(app(options))
            .post('/v1/nopes')
            .send({
              data: {
                type: 'nopes',
                attributes: {
                  label: 'sandwiches',
                  size: 'M',
                  notARealField: true
                }
              }
            })
            .expect(validators.basicValidation)
            .expect(validators.assertData(expectedData))
            .expect(validators.assertLinks(expectedLinks))
            .expect(201)
            .end(done);
        });
    });
  });

  describe('when the request is valid, with a relationship', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink')
      };

      const paginateSeeds = [{
        first_name: 'sandwiches'
      }];

      applyMigrations(this.options)
        .then(() => seed('paginate', paginateSeeds))
        .then(() => done());
    });

    it('should return a 200 OK, with the created resource', (done) => {
      const expectedData = {
        type: 'relations',
        id: '1',
        attributes: {
          name: 'please',
          size: null
        },
        relationships: {
          owner: {
            data: {
              id: '1',
              type: 'paginates'
            }
          }
        }
      };

      const expectedLinks = {
        self: '/v1/relations/1'
      };

      request(app(this.options))
        .post('/v1/relations')
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
        .expect(validators.assertData(expectedData))
        .expect(validators.assertLinks(expectedLinks))
        .expect(201)
        .end(done);
    });
  });
});
