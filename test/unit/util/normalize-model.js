const _ = require('lodash');
const normalizeModel = require('../../../util/normalize-model');

// These are the defaults.
const baseModel = {
  attributes: {},
  meta: {
    created_at: {
      type: 'TIMESTAMPTZ',
      nullable: false,
      default: 'CURRENT_TIMESTAMP'
    },
    updated_at: {
      type: 'TIMESTAMPTZ',
      nullable: true,
      default: null
    }
  },
  relations: {},
  actions: {
    create: true,
    readOne: true,
    readMany: true,
    update: true,
    delete: true
  },
  pagination: {
    defaultPageNumber: 0,
    defaultPageSize: 10,
    enabled: true
  }
};

describe('normalizeModel', function() {
  it('should normalize a model with a name', () => {
    const input = {name: 'cat'};
    const expected = Object.assign({}, baseModel, {
      name: 'cat',
      plural_form: 'cats'
    });
    assert.deepEqual(normalizeModel(input), expected);
  });

  it('should normalize a model with a name and a plural_form', () => {
    const input = {name: 'person', plural_form: 'people'};
    const expected = Object.assign({}, baseModel, {
      name: 'person',
      plural_form: 'people'
    });
    assert.deepEqual(normalizeModel(input), expected);
  });

  it('should normalize a model with custom built_in_meta_attributes', () => {
    const input = {
      name: 'cat',
      built_in_meta_attributes: {
        created_at: false,
        updated_at: false
      }
    };
    const expected = Object.assign({}, baseModel, {
      name: 'cat',
      plural_form: 'cats',
      meta: {}
    });
    assert.deepEqual(normalizeModel(input), expected);
  });

  it('should normalize a model with custom pagination, as an object', () => {
    const input = {
      name: 'cat',
      pagination: {
        defaultPageNumber: 5
      }
    };
    const expected = _.merge({}, baseModel, {
      name: 'cat',
      plural_form: 'cats',
      pagination: {
        defaultPageNumber: 5
      }
    });
    assert.deepEqual(normalizeModel(input), expected);
  });

  it('should normalize a model with custom pagination, as a boolean', () => {
    const input = {
      name: 'cat',
      pagination: false
    };
    const expected = _.merge({}, baseModel, {
      name: 'cat',
      plural_form: 'cats',
      pagination: {
        enabled: false
      }
    });
    assert.deepEqual(normalizeModel(input), expected);
  });

  it('should normalize a model with custom actions', () => {
    const input = {
      name: 'cat',
      actions: {
        readMany: false
      }
    };
    const expected = _.merge({}, baseModel, {
      name: 'cat',
      plural_form: 'cats',
      actions: {
        readMany: false
      }
    });
    assert.deepEqual(normalizeModel(input), expected);
  });

  it('should normalize a model with custom meta', () => {
    const input = {
      name: 'cat',
      meta: {
        license: 'text',
        contract: {
          nullable: false,
          type: 'sandwiches',
          default: 'ok'
        }
      }
    };
    const expected = _.merge({}, baseModel, {
      name: 'cat',
      plural_form: 'cats',
      meta: {
        license: {
          default: null,
          nullable: true,
          type: 'text'
        },
        contract: {
          nullable: false,
          type: 'sandwiches',
          default: 'ok'
        }
      }
    });
    assert.deepEqual(normalizeModel(input), expected);
  });

  it('should normalize a model with custom attributes', () => {
    const input = {
      name: 'cat',
      attributes: {
        first_name: 'text',
        last_name: {
          nullable: false,
          type: 'sandwiches',
          default: 'ok'
        },
        address: {
          type: 'wat'
        }
      }
    };
    const expected = _.merge({}, baseModel, {
      name: 'cat',
      plural_form: 'cats',
      attributes: {
        first_name: {
          nullable: true,
          type: 'text',
          default: null,
        },
        last_name: {
          nullable: false,
          type: 'sandwiches',
          default: 'ok'
        },
        address: {
          nullable: true,
          type: 'wat',
          default: null
        }
      }
    });
    assert.deepEqual(normalizeModel(input), expected);
  });

  it('should normalize a model with relations', () => {
    const input = {
      name: 'cat',
      relations: {
        owner: 'many-to-one',
        nicknames: {
          relationship: 'many-to-many',
          resource: 'nickname'
        }
      }
    };
    const expected = _.merge({}, baseModel, {
      name: 'cat',
      plural_form: 'cats',
      relations: {
        owner: {
          resource: 'owner',
          relationship: 'many-to-one'
        },
        nicknames: {
          relationship: 'many-to-many',
          resource: 'nickname'
        }
      }
    });
    assert.deepEqual(normalizeModel(input), expected);
  });
});
