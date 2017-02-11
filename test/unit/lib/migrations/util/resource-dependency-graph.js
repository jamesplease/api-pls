const depGraph = require('../../../../../lib/sync/util/resource-dependency-graph');

describe('resourceDependencyGraph', function() {
  it('should return an empty array when passed an empty array', () => {
    assert.deepEqual(depGraph([]), []);
  });

  it('should return the resources in the same order when there are no relationships', () => {
    const resources = [
      {name: 'a', relationships: {}},
      {name: 'b', relationships: {}},
      {name: 'c', relationships: {}},
      {name: 'd', relationships: {}},
    ];

    const expected = [
      {name: 'a', relationships: {}},
      {name: 'b', relationships: {}},
      {name: 'c', relationships: {}},
      {name: 'd', relationships: {}},
    ];

    assert.deepEqual(depGraph(resources), expected);
  });

  it('should rearrange them correctly based on their relationships', () => {
    const resources = [
      {
        name: 'a', relationships: {}
      },
      {
        name: 'b', relationships: {
          one: {resource: 'a'}
        }
      },
      {
        name: 'c', relationships: {
          one: {resource: 'b'},
          two: {resource: 'a'}
        }
      },
      {
        name: 'd', relationships: {
          one: {resource: 'a'},
          two: {resource: 'c'}
        }
      },
    ];

    const expected = [
      {
        name: 'a', relationships: {}
      },
      {
        name: 'b', relationships: {
          one: {resource: 'a'}
        }
      },
      {
        name: 'c', relationships: {
          one: {resource: 'b'},
          two: {resource: 'a'}
        }
      },
      {
        name: 'd', relationships: {
          one: {resource: 'a'},
          two: {resource: 'c'}
        }
      },
    ];

    assert.deepEqual(depGraph(resources), expected);
  });

  it('should throw for circular dependencies', () => {
    const resources = [
      {
        name: 'a', relationships: {
          one: {resource: 'b'}
        }
      },
      {
        name: 'b', relationships: {
          one: {resource: 'a'}
        }
      }
    ];

    assert.throws(() => depGraph(resources));
  });
});
