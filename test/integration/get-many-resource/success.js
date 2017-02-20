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

describe('Resource GET (many)', function() {
  // Ensure that the DB connection drops immediately after each test
  afterEach(() => {
    db.$config.pgp.end();
  });

  // Ensure that there's no lingering data between tests by wiping the
  // database before each test.
  beforeEach(done => {
    wipeDatabase(db).then(() => done());
  });

  describe('when the request succeeds', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 1000
      };

      const seeds = [
        {first_name: 'james', last_name: 'please'},
        {first_name: 'shilpa', last_name: 'please'},
        {first_name: 'tim', last_name: 'please'},
        {first_name: 'stephen', last_name: 'please'}
      ];

      applyMigrations(this.options)
        .then(() => seed('no_meta', seeds))
        .then(() => done());
    });

    it('should return a 200 response', (done) => {
      const expectedData = [
        {
          type: 'no_metas',
          id: '1',
          attributes: {
            first_name: 'james',
            last_name: 'please'
          }
        },
        {
          type: 'no_metas',
          id: '2',
          attributes: {
            first_name: 'shilpa',
            last_name: 'please'
          }
        },
        {
          type: 'no_metas',
          id: '3',
          attributes: {
            first_name: 'tim',
            last_name: 'please'
          }
        },
        {
          type: 'no_metas',
          id: '4',
          attributes: {
            first_name: 'stephen',
            last_name: 'please'
          }
        },
      ];

      const expectedLinks = {
        self: '/v1000/no_metas'
      };

      request(app(this.options))
        .get('/v1000/no_metas')
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .end(done);
    });
  });

  describe('when an empty sparse fieldsets is specified', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 5
      };

      const seeds = [
        {first_name: 'james', last_name: 'please'},
        {first_name: 'shilpa', last_name: 'please'},
        {first_name: 'tim', last_name: 'please'},
        {first_name: 'stephen', last_name: 'please'}
      ];

      applyMigrations(this.options)
        .then(() => seed('no_meta', seeds))
        .then(() => done());
    });

    it('should return a 200 response', (done) => {
      const expectedData = [
        {
          type: 'no_metas',
          id: '1',
          attributes: {
            first_name: 'james',
            last_name: 'please'
          }
        },
        {
          type: 'no_metas',
          id: '2',
          attributes: {
            first_name: 'shilpa',
            last_name: 'please'
          }
        },
        {
          type: 'no_metas',
          id: '3',
          attributes: {
            first_name: 'tim',
            last_name: 'please'
          }
        },
        {
          type: 'no_metas',
          id: '4',
          attributes: {
            first_name: 'stephen',
            last_name: 'please'
          }
        },
      ];

      const expectedLinks = {
        self: '/v5/no_metas?fields[no_metas]'
      };

      request(app(this.options))
        .get('/v5/no_metas')
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
        apiVersion: 15
      };

      const seeds = [
        {first_name: 'james', last_name: 'please'},
        {first_name: 'shilpa', last_name: 'please'},
        {first_name: 'tim', last_name: 'please'},
        {first_name: 'stephen', last_name: 'please'}
      ];

      applyMigrations(this.options)
        .then(() => seed('no_meta', seeds))
        .then(() => done());
    });

    it('should return a 200 response', (done) => {
      const expectedData = [
        {
          type: 'no_metas',
          id: '1',
          attributes: {
            first_name: 'james',
          }
        },
        {
          type: 'no_metas',
          id: '2',
          attributes: {
            first_name: 'shilpa',
          }
        },
        {
          type: 'no_metas',
          id: '3',
          attributes: {
            first_name: 'tim',
          }
        },
        {
          type: 'no_metas',
          id: '4',
          attributes: {
            first_name: 'stephen',
          }
        },
      ];

      const expectedLinks = {
        self: '/v15/no_metas?fields[no_metas]=first_name'
      };

      request(app(this.options))
        .get('/v15/no_metas')
        .query('fields[no_metas]=first_name')
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .end(done);
    });
  });

  describe('when the request succeeds with default pagination', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 1
      };

      const seeds = [
        {first_name: 'james', last_name: 'please'},
        {first_name: 'shilpa', last_name: 'please'},
        {first_name: 'tim', last_name: 'please'},
        {first_name: 'stephen', last_name: 'please'}
      ];

      applyMigrations(this.options)
        .then(() => seed('paginate', seeds))
        .then(() => done());
    });

    it('should return a 200 response', (done) => {
      const expectedData = [
        {
          type: 'paginates',
          id: '1',
          attributes: {
            first_name: 'james',
            last_name: 'please'
          }
        },
        {
          type: 'paginates',
          id: '2',
          attributes: {
            first_name: 'shilpa',
            last_name: 'please'
          }
        }
      ];

      const expectedMeta = {
        page_number: 1,
        page_size: 2,
        total_count: 4
      };

      const expectedLinks = {
        self: '/v1/paginates',
        first: '/v1/paginates?page[number]=1',
        last: '/v1/paginates?page[number]=2',
        prev: null,
        next: '/v1/paginates?page[number]=2'
      };

      request(app(this.options))
        .get('/v1/paginates')
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertMeta(expectedMeta))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .end(done);
    });
  });

  describe('when the request succeeds with a custom page and size requested', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 10
      };

      const seeds = [
        {first_name: 'james', last_name: 'please'},
        {first_name: 'shilpa', last_name: 'please'},
        {first_name: 'tim', last_name: 'please'},
        {first_name: 'stephen', last_name: 'please'}
      ];

      applyMigrations(this.options)
        .then(() => seed('paginate', seeds))
        .then(() => done());
    });

    it('should return a 200 response', (done) => {
      const expectedData = [
        {
          type: 'paginates',
          id: '4',
          attributes: {
            first_name: 'stephen',
            last_name: 'please'
          }
        }
      ];

      const expectedMeta = {
        page_number: 2,
        page_size: 3,
        total_count: 4
      };

      const expectedLinks = {
        self: '/v10/paginates?page[number]=2&page[size]=3',
        first: '/v10/paginates?page[number]=1&page[size]=3',
        last: '/v10/paginates?page[number]=2&page[size]=3',
        prev: '/v10/paginates?page[number]=1&page[size]=3',
        next: null
      };

      request(app(this.options))
        .get('/v10/paginates')
        .query('page[number]=2&page[size]=3')
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertMeta(expectedMeta))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .end(done);
    });
  });

  describe('when the request succeeds on an empty list', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 2
      };

      applyMigrations(this.options)
        .then(() => done());
    });

    it('should return a 200 response', (done) => {
      const expectedData = [];

      const expectedMeta = {
        page_number: 1,
        page_size: 2,
        total_count: 0
      };

      const expectedLinks = {
        self: '/v2/paginates',
        first: null,
        last: null,
        prev: null,
        next: null
      };

      request(app(this.options))
        .get('/v2/paginates')
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertMeta(expectedMeta))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .end(done);
    });
  });

  describe('when the request succeeds on a page beyond the last page', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 2
      };

      const seeds = [
        {first_name: 'james', last_name: 'please'},
        {first_name: 'shilpa', last_name: 'please'},
        {first_name: 'tim', last_name: 'please'},
        {first_name: 'stephen', last_name: 'please'}
      ];

      applyMigrations(this.options)
        .then(() => seed('paginate', seeds))
        .then(() => done());
    });

    it('should return a 200 response', (done) => {
      const expectedData = [];

      const expectedMeta = {
        page_number: 100,
        page_size: 2,
        total_count: 4
      };

      const expectedLinks = {
        self: '/v2/paginates?page[number]=100&page[size]=2',
        first: '/v2/paginates?page[number]=1&page[size]=2',
        last: '/v2/paginates?page[number]=2&page[size]=2',
        prev: '/v2/paginates?page[number]=2&page[size]=2',
        next: null
      };

      request(app(this.options))
        .get('/v2/paginates')
        .query('page[number]=100&page[size]=2')
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertMeta(expectedMeta))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .end(done);
    });
  });
});
