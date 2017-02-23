const path = require('path');
const request = require('supertest');
const app = require('../../../server/app');
const getDb = require('../../../lib/database');
const wipeDatabase = require('../../../lib/database/wipe');
const validators = require('../../helpers/json-api-validators');
const applyMigrations = require('../../helpers/apply-migrations');
const seed = require('../../helpers/seed');

const db = getDb();
const fixturesDirectory = path.join(__dirname, '..', '..', 'fixtures');

describe('Resource PATCH success', function() {
  // Ensure that the DB connection drops immediately after each test
  afterEach(() => {
    db.$config.pgp.end();
  });

  // Ensure that there's no lingering data between tests by wiping the
  // database before each test.
  beforeEach(async () => {
    await wipeDatabase(db);
  });

  describe('when the request succeeds, and data is manipulated', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 5
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
        self: '/v5/no_metas/1'
      };

      request(app(this.options))
        .patch('/v5/no_metas/1')
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

  describe('when the request succeeds, and meta is manipulated', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 5
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
        self: '/v5/has_metas/1'
      };

      request(app(this.options))
        .patch('/v5/has_metas/1')
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
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 33
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
        self: '/v33/no_metas/1'
      };

      request(app(this.options))
        .patch('/v33/no_metas/1')
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

  describe('when the request leaves out non-nullable data in a patch', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 1
      };

      const seeds = [{
        first_name: 'james',
        last_name: 'please',
        copyright: 'sandwiches'
      }];

      applyMigrations(this.options)
        .then(() => seed('required', seeds))
        .then(() => done());
    });

    it('should return a 200 response', (done) => {
      const expectedLinks = {
        self: '/v1/requireds/1'
      };

      const expectedData = {
        type: 'requireds',
        id: '1',
        attributes: {
          first_name: 'james',
          last_name: 'please',
        },
        meta: {
          copyright: 'pasta'
        }
      };

      request(app(this.options))
        .patch('/v1/requireds/1')
        .send({
          data: {
            type: 'requireds',
            id: '1',
            meta: {
              copyright: 'pasta'
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
