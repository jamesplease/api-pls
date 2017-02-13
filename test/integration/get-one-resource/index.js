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

describe('Resource GET (one)', function() {
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
        apiVersion: 3
      };

      const expectedErrors = [{
        title: 'Resource Not Found',
        detail: 'The requested resource does not exist.'
      }];

      const expectedLinks = {
        self: '/v3/pastas/1'
      };

      applyMigrations(options)
        .then(() => {
          request(app(options))
            .get('/v3/pastas/1')
            .expect(validators.basicValidation)
            .expect(validators.assertErrors(expectedErrors))
            .expect(validators.assertLinks(expectedLinks))
            .expect(404)
            .end(done);
        });
    });
  });

  describe('when the request succeeds', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 10
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
        self: '/v10/no_metas/1'
      };

      request(app(this.options))
        .get('/v10/no_metas/1')
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .end(done);
    });
  });

  describe('when no valid fields are requested via sparse fields', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 4
      };

      const seeds = [{
        first_name: 'james',
        last_name: 'please'
      }];

      applyMigrations(this.options)
        .then(() => seed('no_meta', seeds))
        .then(() => done());
    });

    it('should return a Bad Request error response', (done) => {
      const expectedErrors = [{
        title: 'Bad Request',
        detail: 'No valid fields were specified for resource "no_metas".'
      }];

      const expectedLinks = {
        self: '/v4/no_metas/1?fields[no_metas]=sandwiches'
      };

      request(app(this.options))
        .get('/v4/no_metas/1')
        .query('fields[no_metas]=sandwiches')
        .expect(validators.basicValidation)
        .expect(validators.assertErrors(expectedErrors))
        .expect(validators.assertLinks(expectedLinks))
        .expect(400)
        .end(done);
    });
  });

  describe('when an empty sparse fieldsets param is specified', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 16
      };

      const seeds = [{
        first_name: 'james',
        last_name: 'please'
      }];

      applyMigrations(this.options)
        .then(() => seed('no_meta', seeds))
        .then(() => done());
    });

    it('should return a 200 response with all fields', (done) => {
      const expectedData = {
        type: 'no_metas',
        id: '1',
        attributes: {
          first_name: 'james',
          last_name: 'please'
        }
      };

      const expectedLinks = {
        self: '/v16/no_metas/1?fields[no_metas]'
      };

      request(app(this.options))
        .get('/v16/no_metas/1')
        .query('fields[no_metas]')
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .end(done);
    });
  });

  describe('when the request succeeds with sparse fieldsets', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 1
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
        }
      };

      const expectedLinks = {
        self: '/v1/no_metas/1?fields[no_metas]=first_name'
      };

      request(app(this.options))
        .get('/v1/no_metas/1')
        .query('fields[no_metas]=first_name')
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .end(done);
    });
  });

  describe('when the request succeeds, with a relationship', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 2
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

    it('should return a 200 OK, with the resource', (done) => {
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
              id: '1',
              type: 'paginates'
            },
            links: {
              related: '/v2/relations/1/owner',
              self: '/v2/paginates/1'
            }
          }
        }
      };

      const expectedLinks = {
        self: '/v2/relations/1'
      };

      request(app(this.options))
        .get('/v2/relations/1')
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .end(done);
    });
  });
});
