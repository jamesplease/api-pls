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

describe('Resource PATCH', function() {
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
        self: '/v1/pastas/1'
      };

      applyMigrations(options)
        .then(() => {
          request(app(options))
            .patch('/v1/pastas/1')
            .expect(validators.basicValidation)
            .expect(validators.assertErrors(expectedErrors))
            .expect(validators.assertLinks(expectedLinks))
            .expect(404)
            .end(done);
        });
    });
  });

  describe('attempting to PATCH an entire list of resources', () => {
    it('should return a Method Not Allowed error response', (done) => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink')
      };

      const expectedErrors = [{
        title: 'Method Not Allowed',
        detail: 'This method is not permitted on this resource.'
      }];

      const expectedLinks = {
        self: '/v1/nopes'
      };

      applyMigrations(options)
        .then(() => {
          request(app(options))
            .patch('/v1/nopes')
            .expect(validators.basicValidation)
            .expect(validators.assertErrors(expectedErrors))
            .expect(validators.assertLinks(expectedLinks))
            .expect(405)
            .end(done);
        });
    });
  });

  describe('when the request succeeds, and data is manipulated', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink')
      };

      const seeds = [{
        first_name: 'james',
        last_name: 'please'
      }];

      applyMigrations(this.options)
        .then(() => seed('no_meta', seeds))
        .then(() => done());
    });

    it('should return a 200 response', (done) => {
      const expectedData = {
        type: 'no_metas',
        id: '1',
        attributes: {
          first_name: 'eric',
          last_name: 'please'
        }
      };

      const expectedLinks = {
        self: '/v1/no_metas/1'
      };

      request(app(this.options))
        .patch('/v1/no_metas/1')
        .send({
          data: {
            type: 'no_metas',
            id: '1',
            attributes: {
              first_name: 'eric',
              last_name: 'please'
            }
          }
        })
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .end(done);
    });
  });

  describe('when the ID in the body does not match the url', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink')
      };

      const seeds = [{
        first_name: 'james',
        last_name: 'please'
      }];

      applyMigrations(this.options)
        .then(() => seed('no_meta', seeds))
        .then(() => done());
    });

    it('should return a Bad Request response', (done) => {
      const expectedErrors = [{
        title: 'Bad Request',
        detail: '"params.id" should be equal to constant'
      }];

      const expectedLinks = {
        self: '/v1/no_metas/1'
      };

      request(app(this.options))
        .patch('/v1/no_metas/1')
        .send({
          data: {
            type: 'no_metas',
            id: '3',
            attributes: {
              first_name: 'eric',
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

  describe('when the request succeeds, and meta is manipulated', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink')
      };

      const seeds = [{
        first_name: 'james',
        last_name: 'please'
      }];

      applyMigrations(this.options)
        .then(() => seed('has_meta', seeds))
        .then(() => done());
    });

    it('should return a 200 response', (done) => {
      const expectedData = {
        type: 'has_metas',
        id: '1',
        attributes: {
          first_name: 'james',
          last_name: 'please'
        },
        meta: {
          copyright: 'ISC'
        }
      };

      const expectedLinks = {
        self: '/v1/has_metas/1'
      };

      request(app(this.options))
        .patch('/v1/has_metas/1')
        .send({
          data: {
            type: 'has_metas',
            id: '1',
            meta: {
              copyright: 'ISC'
            }
          }
        })
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .end(done);
    });
  });

  describe('when the request succeeds, but nothing is manipulated', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink')
      };

      const seeds = [{
        first_name: 'james',
        last_name: 'please'
      }];

      applyMigrations(this.options)
        .then(() => seed('no_meta', seeds))
        .then(() => done());
    });

    it('should return a 200 response', (done) => {
      const expectedData = {
        type: 'no_metas',
        id: '1',
        attributes: {
          first_name: 'james',
          last_name: 'please'
        }
      };

      const expectedLinks = {
        self: '/v1/no_metas/1'
      };

      request(app(this.options))
        .patch('/v1/no_metas/1')
        .send({
          data: {
            type: 'no_metas',
            id: '1',
            attributes: {
              what: 'sandwiches'
            }
          }
        })
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .end(done);
    });
  });

  describe('when the request is valid, with a relationship', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink')
      };

      const paginateSeeds = [
        {first_name: 'sandwiches'},
        {first_name: 'what'},
        {first_name: 'pls'}
      ];

      const relationSeeds = [
        {name: 'james', owner_id: '1'}
      ];

      applyMigrations(this.options)
        .then(() => seed('paginate', paginateSeeds))
        .then(() => seed('relation', relationSeeds))
        .then(() => done());
    });

    it('should return a 200 OK, with the updated resource', (done) => {
      const expectedData = {
        type: 'relations',
        id: '1',
        attributes: {
          name: 'james',
          size: null
        },
        relationships: {
          owner: {
            data: {
              id: '3',
              type: 'paginates'
            }
          }
        }
      };

      const expectedLinks = {
        self: '/v1/relations/1'
      };

      request(app(this.options))
        .patch('/v1/relations/1')
        .send({
          data: {
            id: '1',
            type: 'relations',
            relationships: {
              owner: {
                data: {
                  id: '3',
                  type: 'paginates'
                }
              }
            }
          }
        })
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .end(done);
    });
  });
});
