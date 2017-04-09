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
  beforeEach(() => {
    return wipeDatabase(db);
  });

  describe('when the request succeeds, and data is manipulated', () => {
    it.only('should return a 200 response', async () => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 5
      };

      const seeds = [{
        first_name: 'james',
        last_name: 'please'
      }];

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

      await applyMigrations(options);
      await seed('no_meta', seeds);
      return request(app(options))
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
        .then();
    });
  });

  describe('when the request succeeds, and meta is manipulated', () => {
    it.only('should return a 200 response', async () => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 5
      };

      const seeds = [{
        first_name: 'james',
        last_name: 'please'
      }];

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

      await applyMigrations(options);
      await seed('has_meta', seeds);
      return request(app(options))
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
        .then();
    });
  });

  describe('when the request succeeds, but nothing is manipulated', () => {
    it.only('should return a 200 response', async () => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 33
      };

      const seeds = [{
        first_name: 'james',
        last_name: 'please'
      }];

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

      await applyMigrations(options);
      await seed('no_meta', seeds);
      return request(app(options))
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
        .then();
    });
  });

  describe('when the request leaves out non-nullable data in a patch', () => {
    it.only('should return a 200 response', async () => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 1
      };

      const seeds = [{
        first_name: 'james',
        last_name: 'please',
        copyright: 'sandwiches'
      }];

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

      await applyMigrations(options);
      await seed('required', seeds);
      return request(app(options))
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
        .then();
    });
  });
});
