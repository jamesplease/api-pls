const path = require('path');
const request = require('supertest');
const app = require('../../../server/app');
const getDb = require('../../../lib/database');
const wipeDatabase = require('../../../lib/wipe-database');
const validators = require('../../helpers/json-api-validators');

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

  describe('When the resource does not exist', () => {
    it('should return a Not Found error response', (done) => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'empty-resources')
      };

      const expectedErrors = [{
        title: 'Resource Not Found',
        detail: 'The requested resource does not exist.'
      }];

      request(app(options))
        .post('/v1/pastas')
        .expect(validators.basicValidation)
        .expect(validators.assertErrors(expectedErrors))
        .expect(404)
        .end(done);
    });
  });

  describe('When the resource does not permit POST', () => {
    it('should return a Not Allowed error response', (done) => {
      const options = {
        resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink')
      };

      const expectedErrors = [{
        title: 'Method Not Allowed',
        detail: 'This method is not permitted on this resource.'
      }];

      request(app(options))
        .post('/v1/no-cruds')
        .expect(validators.basicValidation)
        .expect(validators.assertErrors(expectedErrors))
        .expect(405)
        .end(done);
    });
  });

  // describe('When the request body is invalid', () => {
  //   it('should return a No Valid Fields error response', (done) => {
  //     const options = {
  //       resourcesDirectory: path.join(fixturesDirectory, 'kitchen-sink')
  //     };
  //
  //     // const expectedErrors = [{
  //     //   title: 'Method Not Allowed',
  //     //   detail: 'This method is not permitted on this resource.'
  //     // }];
  //
  //     request(app(options))
  //       .post('/v1/nopes')
  //       .send({
  //         data: {
  //           type: 'nopes',
  //           attributes: {
  //             size: 'M',
  //             label: 'hello'
  //           }
  //         }
  //       })
  //       .expect(validators.basicValidation)
  //       // .expect(validators.assertErrors(expectedErrors))
  //       .expect(400)
  //       .end(done);
  //   });
  // });
});
