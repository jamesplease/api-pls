const util = require('util');
const _ = require('lodash');
const isMyJsonValid = require('is-my-json-valid');
const jsonApiSchema = require('./json-api-schema');
const error = require('./diff-error');

const inspect = util.inspect;
const validator = isMyJsonValid(jsonApiSchema);

// These are handy methods that can be composed as "middleware" to validate
// responses.
module.exports = {
  // This does a cursory inspection of the response to make sure that it
  // generally adheres to JSON API. The schema used is the official JSON API
  // schema, yet it will not catch all problems. From the documentation:
  // "Validation will not yield false negatives, but could yield false positives
  // for the sake of flexibility."
  basicValidation(res) {
    if (!validator(res.body)) {
      throw new Error(`The response body does not adhere to JSON API. ${inspect(res.body)}. Errors: ${inspect(validator.errors)}`);
    }
  },

  assertEmptyBody(res) {
    if (_.size(res.body)) {
      throw new Error(`Expected empty body, but got: ${inspect(res.body)}`);
    }
  },

  // Assert the value of `body.errors`
  assertErrors(expected) {
    return function(res) {
      const actual = res.body.errors;
      if (!_.isEqual(actual, expected)) {
        throw error({
          msg: `expected ${inspect(expected)} errors, got ${inspect(actual)}`,
          actual,
          expected
        });
      }
    };
  },

  // Assert the value of `body.data`
  assertData(expected) {
    return function(res) {
      const actual = res.body.data;
      if (!_.isEqual(actual, expected)) {
        throw error({
          msg: `expected ${inspect(expected)} data, got ${inspect(actual)}`,
          actual,
          expected
        });
      }
    };
  },

  // Assert the value of `body.meta`
  assertMeta(expected) {
    return function(res) {
      const actual = res.body.meta;
      if (!_.isEqual(actual, expected)) {
        throw error({
          msg: `expected ${inspect(expected)} meta, got ${inspect(actual)}`,
          actual,
          expected
        });
      }
    };
  },

  // Assert the value of `body.jsonapi`
  assertJsonapi(expected) {
    return function(res) {
      const actual = res.body.jsonapi;
      if (!_.isEqual(actual, expected)) {
        throw error({
          msg: `expected ${inspect(expected)} jsonapi, got ${inspect(actual)}`,
          actual,
          expected
        });
      }
    };
  },

  // Assert the value of `body.links`
  assertLinks(expected) {
    return function(res) {
      const actual = res.body.links;
      if (!_.isEqual(actual, expected)) {
        throw error({
          msg: `expected ${inspect(expected)} links, got ${inspect(actual)}`,
          actual,
          expected
        });
      }
    };
  },

  // Assert the value of `body.included`
  assertIncluded(expected) {
    return function(res) {
      const actual = res.body.included;
      if (!_.isEqual(actual, expected)) {
        throw error({
          msg: `expected ${inspect(expected)} included, got ${inspect(actual)}`,
          actual,
          expected
        });
      }
    };
  }
};
