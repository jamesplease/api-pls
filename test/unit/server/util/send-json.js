const sendJson = require('../../../../server/util/send-json');

describe('sendJson', function() {
  beforeEach(() => {
    this.res = {
      send: stub()
    };
  });

  describe('when passing in nothing', () => {
    it('should call `res.send` with the right arguments', () => {
      sendJson(this.res);
      assert(this.res.send.calledOnce, 'res.send was not called');

      const arg = new Buffer(JSON.stringify({}));
      assert.deepEqual(arg, this.res.send.getCall(0).args[0]);
    });
  });

  describe('when passing in an object', () => {
    it('should call `res.send` with the right arguments', () => {
      const someObj = {
        name: 'sandwiches'
      };

      sendJson(this.res, someObj);
      assert(this.res.send.calledOnce, 'res.send was not called');

      const arg = new Buffer(JSON.stringify(someObj));
      assert.deepEqual(arg, this.res.send.getCall(0).args[0]);
    });
  });
});
