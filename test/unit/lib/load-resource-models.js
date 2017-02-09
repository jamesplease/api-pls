const path = require('path');
const loadResourceModels = require('../../../lib/load-resource-models');

const fixturesPath = path.join(__dirname, '..', '..', 'fixtures');

describe('loadResourceModels', function() {
  it('should return an empty array when passed an empty directory', () => {
    const resourceDirectory = path.join(fixturesPath, 'empty-resources');
    assert.deepEqual(loadResourceModels(resourceDirectory), []);
  });

  it('should error when there is a syntax error', () => {
    const resourceDirectory = path.join(fixturesPath, 'syntax-error');
    assert.throws(() => loadResourceModels(resourceDirectory));
  });

  it('should return files with content, and filter out empty files', () => {
    const resourceDirectory = path.join(fixturesPath, 'some-empty');
    const expected = [{name: 'hello'}];
    assert.deepEqual(loadResourceModels(resourceDirectory), expected);
  });
});
