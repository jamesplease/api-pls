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

describe('Resource POST success', function() {
  // Ensure that the DB connection drops immediately after each test
  afterEach(() => {
    db.$config.pgp.end();
  });

  // Ensure that there's no lingering data between tests by wiping the
  // database before each test.
  beforeEach(done => {
    wipeDatabase(db).then(() => done());
  });

  describe('when the request is valid', () => {
    it('should return a 200 OK, with the created resource', (done) => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 2
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
        self: '/v2/nopes/1'
      };

      applyMigrations(options)
        .then(() => {
          request(app(options))
            .post('/v2/nopes')
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
            .expect('Location', '/v2/nopes/1')
            .expect(201)
            .end(done);
        });
    });
  });

  describe('when the request is valid, but has extraneous fields', () => {
    it('should return a 200 OK, with the created resource', (done) => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 50
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
        self: '/v50/nopes/1'
      };

      applyMigrations(options)
        .then(() => {
          request(app(options))
            .post('/v50/nopes')
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
            .expect('Location', '/v50/nopes/1')
            .expect(201)
            .end(done);
        });
    });
  });

  describe('when the request is valid, with a many-to-one relationship', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 10
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
            },
            links: {
              self: '/v10/paginates/1',
              related: '/v10/relations/1/owner'
            }
          }
        }
      };

      const expectedLinks = {
        self: '/v10/relations/1'
      };

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
        .expect(validators.assertData(expectedData))
        .expect(validators.assertLinks(expectedLinks))
        .expect('Location', '/v10/relations/1')
        .expect(201)
        .end(done);
    });
  });

  describe('when the request is valid, with a one-to-one relationship', () => {
    beforeEach((done) => {
      this.options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 10
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
        type: 'one_to_ones',
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
            },
            links: {
              self: '/v10/paginates/1',
              related: '/v10/one_to_ones/1/owner'
            }
          }
        }
      };

      const expectedLinks = {
        self: '/v10/one_to_ones/1'
      };

      request(app(this.options))
        .post('/v10/one_to_ones')
        .send({
          data: {
            type: 'one_to_ones',
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
        .expect('Location', '/v10/one_to_ones/1')
        .expect(201)
        .end(done);
    });
  });

  describe('when non-nullable meta is included, and the request succeeds', () => {
    it('should return a 201 Created response', (done) => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink'),
        apiVersion: 5
      };

      const expectedLinks = {
        self: '/v5/required_metas/1'
      };

      const expectedData = {
        type: 'required_metas',
        id: '1',
        attributes: {
          first_name: 'james',
          last_name: 'please'
        },
        meta: {
          copyright: 'sandwiches'
        }
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
                meta: {
                  copyright: 'sandwiches'
                }
              }
            })
            .expect(validators.basicValidation)
            .expect(validators.assertData(expectedData))
            .expect(validators.assertLinks(expectedLinks))
            .expect('Location', '/v5/required_metas/1')
            .expect(201)
            .end(done);
        });
    });
  });
});
