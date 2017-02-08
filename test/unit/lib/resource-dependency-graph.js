const depGraph = require('../../../lib/resource-dependency-graph');

describe('resourceDependencyGraph', function() {
  it('should return an empty array when passed an empty array', () => {
    assert.deepEqual(depGraph([]), []);
  });

  it('should return the resources in the same order when there are no relationships', () => {
    const resources = [
      {name: 'a', relations: {}},
      {name: 'b', relations: {}},
      {name: 'c', relations: {}},
      {name: 'd', relations: {}},
    ];

    const expected = [
      {name: 'a', relations: {}},
      {name: 'b', relations: {}},
      {name: 'c', relations: {}},
      {name: 'd', relations: {}},
    ];

    assert.deepEqual(depGraph(resources), expected);
  });

  it('should rearrange them correctly based on their relationships', () => {
    const resources = [
      {
        name: 'a', relations: {}
      },
      {
        name: 'b', relations: {
          one: {resource: 'a'}
        }
      },
      {
        name: 'c', relations: {
          one: {resource: 'b'},
          two: {resource: 'a'}
        }
      },
      {
        name: 'd', relations: {
          one: {resource: 'a'},
          two: {resource: 'c'}
        }
      },
    ];

    const expected = [
      {
        name: 'a', relations: {}
      },
      {
        name: 'b', relations: {
          one: {resource: 'a'}
        }
      },
      {
        name: 'c', relations: {
          one: {resource: 'b'},
          two: {resource: 'a'}
        }
      },
      {
        name: 'd', relations: {
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
        name: 'a', relations: {
          one: {resource: 'b'}
        }
      },
      {
        name: 'b', relations: {
          one: {resource: 'a'}
        }
      }
    ];

    assert.throws(() => depGraph(resources));
  });
});
