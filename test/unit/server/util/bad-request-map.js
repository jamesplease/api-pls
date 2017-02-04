const requestErrorMap = require('../../../../server/util/bad-request-map');

describe('requestErrorMap', function() {
  describe('when passing in nothing', () => {
    it('should return an empty Array', () => {
      assert.deepEqual(requestErrorMap(), []);
    });
  });

  describe('when passing an empty Array', () => {
    it('should return an empty Array', () => {
      assert.deepEqual(requestErrorMap([]), []);
    });
  });

  describe('when passing a single is-my-json-valid error', () => {
    it('should return an empty Array', () => {
      var input = [{
        field: 'data.hello',
        message: 'is required'
      }];

      var expected = [{
        title: 'Bad Request',
        detail: '"hello" is required'
      }];

      assert.deepEqual(requestErrorMap(input), expected);
    });
  });

  describe('when passing multiple is-my-json-valid errors', () => {
    it('should return an empty Array', () => {
      var input = [{
        field: 'data.hello',
        message: 'is required'
      }, {
        field: 'data.id',
        message: 'is the wrong type'
      }];

      var expected = [{
        title: 'Bad Request',
        detail: '"hello" is required'
      }, {
        title: 'Bad Request',
        detail: '"id" is the wrong type'
      }];

      assert.deepEqual(requestErrorMap(input), expected);
    });
  });
});
