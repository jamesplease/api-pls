// This is an Error that will print pretty diffs in Mocha.
module.exports = function({msg, expected, actual}) {
  var err = new Error(msg);
  err.expected = expected;
  err.actual = actual;
  err.showDiff = true;
  return err;
};
