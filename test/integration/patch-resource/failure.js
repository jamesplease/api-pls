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

describe('Resource PATCH failure', function() {
  // Ensure that the DB connection drops immediately after each test
  afterEach(() => {
    db.$config.pgp.end();
  });

  // Ensure that there's no lingering data between tests by wiping the
  // database before each test.
  beforeEach(() => {
    return wipeDatabase(db);
  });

  describe('when the resource does not exist', () => {
    it('should return a Not Found error response', async () => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'empty-resources'),
        apiVersion: 2
      };

      const expectedErrors = [{
        title: 'Resource Not Found',
        detail: 'The requested resource does not exist.'
      }];

      const expectedLinks = {
        self: '/v2/pastas/1'
      };

      await applyMigrations(options);
      return request(app(options))
        .patch('/v2/pastas/1')
        .expect(validators.basicValidation)
        .expect(validators.assertErrors(expectedErrors))
        .expect(validators.assertLinks(expectedLinks))
        .expect(404)
        .then();
    });
  });

  describe('attempting to PATCH an entire list of resources', () => {
    it('should return a Method Not Allowed error response', async () => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: '1.5'
      };

      const expectedErrors = [{
        title: 'Method Not Allowed',
        detail: 'This method is not permitted on this resource.'
      }];

      const expectedLinks = {
        self: '/v1.5/nopes'
      };

      await applyMigrations(options);
      return request(app(options))
        .patch('/v1.5/nopes')
        .expect(validators.basicValidation)
        .expect(validators.assertErrors(expectedErrors))
        .expect(validators.assertLinks(expectedLinks))
        .expect(405)
        .then();
    });
  });

  describe('when the ID in the body does not match the url', () => {
    it('should return a Bad Request response', async () => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 1
      };

      const seeds = [{
        first_name: 'james',
        last_name: 'please'
      }];

      const expectedErrors = [{
        title: 'Bad Request',
        detail: '"params.id" should be equal to constant'
      }];

      const expectedLinks = {
        self: '/v1/no_metas/1'
      };

      await applyMigrations(options);
      await seed('no_meta', seeds);
      return request(app(options))
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
        .then();
    });
  });

  describe('when the request tries to null non-nullable meta', () => {
    it('should return a Bad Request response', async () => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 1
      };

      const seeds = [{
        first_name: 'james',
        last_name: 'please',
        copyright: 'sandwiches'
      }];

      const expectedErrors = [{
        title: 'Bad Request',
        // What a weird message...
        detail: '"body.data.meta.copyright" should NOT be valid'
      }];

      const expectedLinks = {
        self: '/v1/required_metas/1'
      };

      await applyMigrations(options);
      await seed('required_meta', seeds);
      return request(app(options))
        .patch('/v1/required_metas/1')
        .send({
          data: {
            type: 'required_metas',
            id: '1',
            meta: {
              copyright: null
            }
          }
        })
        .expect(validators.basicValidation)
        .expect(validators.assertErrors(expectedErrors))
        .expect(validators.assertLinks(expectedLinks))
        .expect(400)
        .then();
    });
  });

  describe('when the request does not have a "data" property', () => {
    it('should return a Bad Request response', async () => {
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

      const expectedErrors = [{
        title: 'Bad Request',
        detail: '"body" should have required property \'data\''
      },
      // This error could be hard to interpret
      {
        detail: '"params.id" should be equal to constant',
        title: 'Bad Request'
      }];

      await applyMigrations(options);
      await seed('required', seeds);
      return request(app(options))
        .patch('/v1/requireds/1')
        .send({
          type: 'requireds',
          id: '1',
          meta: {
            copyright: 'pasta'
          }
        })
        .expect(validators.basicValidation)
        .expect(validators.assertErrors(expectedErrors))
        .expect(validators.assertLinks(expectedLinks))
        .expect(400)
        .then();
    });
  });
});
