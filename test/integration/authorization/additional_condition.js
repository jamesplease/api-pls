const path = require('path');
const request = require('supertest');
const app = require('../../../server/app');
const getDb = require('../../../lib/database');
const wipeDatabase = require('../../../lib/database/wipe');
const validators = require('../../helpers/json-api-validators');
const applyMigrations = require('../../helpers/apply-migrations');
const seed = require('../../helpers/seed');

const db = getDb();

describe('additional_condition', function() {
  // Ensure that the DB connection drops immediately after each test
  afterEach(() => {
    db.$config.pgp.end();
  });

  // Ensure that there's no lingering data between tests by wiping the
  // database before each test.
  beforeEach(() => {
    return wipeDatabase(db);
  });

  describe('read one', () => {
    describe('when the additional condition matches', () => {
      it('should return a 200 response', async () => {
        const options = {
          resourcesDirectory: path.join(global.fixturesDirectory, 'authorization'),
          apiVersion: 10
        };

        const seeds = [{
          label: 'Subway',
          user_id: '2'
        }];

        const expectedData = {
          type: 'transactions',
          id: '1',
          attributes: {
            label: 'Subway',
            user_id: '2'
          }
        };

        const expectedLinks = {
          self: '/v10/transactions/1'
        };

        await applyMigrations(options);
        await seed('transaction', seeds);
        return request(app(options))
          .get('/v10/transactions/1')
          .expect(validators.basicValidation)
          .expect(validators.assertData(expectedData))
          .expect(validators.assertLinks(expectedLinks))
          .expect(200)
          .then();
      });
    });

    describe('when the additional condition does not match', () => {
      it('should return a 200 response', async () => {
        const options = {
          resourcesDirectory: path.join(global.fixturesDirectory, 'authorization'),
          apiVersion: 10
        };

        const seeds = [{
          label: 'Subway',
          user_id: '1'
        }];

        const expectedErrors = [{
          title: 'Resource Not Found',
          detail: 'The requested resource does not exist.'
        }];

        const expectedLinks = {
          self: '/v10/transactions/1'
        };

        await applyMigrations(options);
        await seed('transaction', seeds);
        return request(app(options))
          .get('/v10/transactions/1')
          .expect(validators.basicValidation)
          .expect(validators.assertErrors(expectedErrors))
          .expect(validators.assertLinks(expectedLinks))
          .expect(404)
          .then();
      });
    });
  });

  describe('read many', () => {
    describe('when the additional condition matches some results', () => {
      it('should return a 200 response', async () => {
        const options = {
          resourcesDirectory: path.join(global.fixturesDirectory, 'authorization'),
          apiVersion: 10
        };

        const seeds = [
          {label: 'Subway', user_id: '2'},
          {label: 'Whole Foods', user_id: '1'},
          {label: 'Pizza Hut', user_id: '4'},
          {label: 'Veggie Grill', user_id: '2'},
          {label: 'Yummy', user_id: '6'},
        ];

        const expectedData = [
          {
            type: 'transactions',
            id: '1',
            attributes: {
              label: 'Subway',
              user_id: '2'
            }
          },
          {
            type: 'transactions',
            id: '4',
            attributes: {
              label: 'Veggie Grill',
              user_id: '2'
            }
          }
        ];

        const expectedLinks = {
          self: '/v10/transactions',
          first: '/v10/transactions?page[number]=1',
          last: '/v10/transactions?page[number]=1',
          next: null,
          prev: null,
        };

        await applyMigrations(options);
        await seed('transaction', seeds);
        return request(app(options))
          .get('/v10/transactions')
          .expect(validators.basicValidation)
          .expect(validators.assertData(expectedData))
          .expect(validators.assertLinks(expectedLinks))
          .expect(200)
          .then();
      });
    });

    describe('when the additional condition matches no results', () => {
      it('should return a 404 response', async () => {
        const options = {
          resourcesDirectory: path.join(global.fixturesDirectory, 'authorization'),
          apiVersion: 10
        };

        const seeds = [
          {label: 'Subway', user_id: '10'},
          {label: 'Whole Foods', user_id: '1'},
          {label: 'Pizza Hut', user_id: '4'},
          {label: 'Veggie Grill', user_id: '11'},
          {label: 'Yummy', user_id: '6'},
        ];

        const expectedData = [];

        const expectedLinks = {
          self: '/v10/transactions',
          first: null,
          last: null,
          next: null,
          prev: null,
        };

        await applyMigrations(options);
        await seed('transaction', seeds);
        return request(app(options))
          .get('/v10/transactions')
          .expect(validators.basicValidation)
          .expect(validators.assertData(expectedData))
          .expect(validators.assertLinks(expectedLinks))
          .expect(200)
          .then();
      });
    });
  });
});
