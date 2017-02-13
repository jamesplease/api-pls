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

  describe('when the resource does not exist', () => {
    it('should return a Not Found error response', (done) => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'empty-resources'),
        apiVersion: 1
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
            .get('/v1/pastas')
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

  describe('when no valid fields are requested via sparse fields', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 3
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
        self: '/v3/no_metas?fields[no_metas]=sandwiches'
      };

      request(app(this.options))
        .get('/v3/no_metas')
        .query('fields[no_metas]=sandwiches')
        .expect(validators.basicValidation)
        .expect(validators.assertErrors(expectedErrors))
        .expect(validators.assertLinks(expectedLinks))
        .expect(400)
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
        page_number: 0,
        page_size: 2,
        total_count: 4
      };

      const expectedLinks = {
        self: '/v1/paginates'
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
        page_number: 1,
        page_size: 3,
        total_count: 4
      };

      const expectedLinks = {
        self: '/v10/paginates?page[number]=1&page[size]=3'
      };

      request(app(this.options))
        .get('/v10/paginates')
        .query('page[number]=1&page[size]=3')
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertMeta(expectedMeta))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .end(done);
    });
  });

  describe('when the request succeeds with no results', () => {
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

    it('should return a 200 response, but with 0 total_count', (done) => {
      const expectedData = [];

      const expectedMeta = {
        page_number: 100,
        page_size: 10,
        total_count: 0
      };

      const expectedLinks = {
        self: '/v2/paginates?page[number]=100&page[size]=10'
      };

      request(app(this.options))
        .get('/v2/paginates')
        .query('page[number]=100&page[size]=10')
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertMeta(expectedMeta))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .end(done);
    });
  });

  describe('when the request succeeds, with a relationship', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 5
      };

      const paginateSeeds = [
        {first_name: 'sandwiches'},
        {first_name: 'what'},
        {first_name: 'pls'}
      ];

      const relationSeeds = [
        {name: 'james', size: 's', owner_id: '1'},
        {name: 'pragya', size: null, owner_id: '3'},
        {name: 'tim', size: null, owner_id: null},
      ];

      applyMigrations(this.options)
        .then(() => seed('paginate', paginateSeeds))
        .then(() => seed('relation', relationSeeds))
        .then(() => done());
    });

    it('should return a 200 OK, with the resource', (done) => {
      const expectedData = [
        {
          type: 'relations',
          id: '1',
          attributes: {
            name: 'james',
            size: 's'
          },
          relationships: {
            owner: {
              data: {
                id: '1',
                type: 'paginates'
              },
              links: {
                self: '/v5/paginates/1',
                related: '/v5/relations/1/owner'
              }
            }
          }
        },
        {
          type: 'relations',
          id: '2',
          attributes: {
            name: 'pragya',
            size: null
          },
          relationships: {
            owner: {
              data: {
                id: '3',
                type: 'paginates'
              },
              links: {
                self: '/v5/paginates/3',
                related: '/v5/relations/2/owner'
              }
            }
          }
        },
        {
          type: 'relations',
          id: '3',
          attributes: {
            name: 'tim',
            size: null
          },
          relationships: {
            owner: {
              links: {
                related: '/v5/relations/3/owner'
              }
            }
          }
        }
      ];

      const expectedMeta = {
        page_number: 0,
        page_size: 10,
        total_count: 3
      };

      const expectedLinks = {
        self: '/v5/relations?page[size]=10'
      };

      request(app(this.options))
        .get('/v5/relations')
        .query('page[size]=10')
        .expect(validators.basicValidation)
        .expect(validators.assertData(expectedData))
        .expect(validators.assertMeta(expectedMeta))
        .expect(validators.assertLinks(expectedLinks))
        .expect(200)
        .end(done);
    });
  });
});
