const pgp = require('pg-promise');
const rewire = require('rewire');
const handleQueryError = rewire('../../../../server/util/handle-query-error');

// These tests involve quite a lot of set up, due to the rewiring and, in some
// cases, lack of rewiring (with the pg-promise Error). Ideally, integration
// tests would grab this, but to do that I'll need to generate a SQL error
// through the API that I don't want to catch earlier.
describe('handleQueryError', function() {
  beforeEach(() => {
    this.mockMappedError = {
      code: 2,
      body() {
        return {
          hungry: false
        };
      }
    };

    this.sendJsonStub = stub();

    const mockMapPgError = stub().returns(this.mockMappedError);

    this.resetSendJson = handleQueryError.__set__('sendJson', this.sendJsonStub);
    this.resetMapPgError = handleQueryError.__set__('mapPgError', mockMapPgError);
    this.statusStub = stub();

    this.res = {
      status: this.statusStub
    };
  });

  afterEach(() => {
    this.resetSendJson();
    this.resetMapPgError();
  });

  describe('when the error is a pgp.errors.QueryResultError', () => {
    it('should return the mapped error', () => {
      const req = {};
      const resource = {};

      handleQueryError({
        err: new pgp.errors.QueryResultError(0, {rows: {}}),
        res: this.res,
        req, resource
      });

      assert(this.res.status.calledOnce);
      assert(this.res.status.calledWithExactly(2));
      assert(this.sendJsonStub.calledOnce);
      assert(this.sendJsonStub.calledWith(this.res, {
        errors: [{
          hungry: false
        }]
      }));
    });
  });

  describe('when the error is not an Error from pgp.error', () => {
    it('should return a generic error', () => {
      const req = {};
      const resource = {};

      handleQueryError({
        err: {},
        res: this.res,
        req, resource
      });

      assert(this.res.status.calledOnce);
      assert(this.res.status.calledWithExactly(500));
      assert(this.sendJsonStub.calledOnce);
      assert(this.sendJsonStub.calledWith(this.res, {
        errors: [{
          title: 'Server Error',
          detail: 'The server encounted an error while processing your request'
        }]
      }));
    });
  });
});
