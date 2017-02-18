const validate = require('../../../lib/resource-model/validate');

describe('validateResourceModel', function() {
  it('should return false for empty models', () => {
    assert.equal(validate({}), false);
  });

  describe('name', () => {
    it('should return true as a string', () => {
      assert.equal(validate({
        name: 'pizza'
      }), true);
    });
  });

  describe('plural_form', () => {
    it('should return true as a string', () => {
      assert.equal(validate({
        name: 'person',
        plural_form: 'people'
      }), true);
    });

    it('should return false when invalid', () => {
      assert.equal(validate({
        name: 'pizza',
        plural_form: true
      }), false);

      assert.equal(validate({
        name: 'pizza',
        plural_form: {}
      }), false);

      assert.equal(validate({
        name: 'pizza',
        plural_form: /asdasd/
      }), false);
    });
  });

  describe('pagination', () => {
    it('should return true when a boolean is passed', () => {
      assert.equal(validate({
        name: 'person',
        pagination: false
      }), true);

      assert.equal(validate({
        name: 'person',
        pagination: true
      }), true);
    });

    it('should return true when an object of the proper form is passed', () => {
      assert.equal(validate({
        name: 'person',
        pagination: {
          enabled: true,
          default_page_size: 10,
          default_page_number: 3
        }
      }), true);

      assert.equal(validate({
        name: 'person',
        pagination: {
          enabled: true,
          default_page_number: 3
        }
      }), true);
    });

    it('should return false if unrecognized properties exist', () => {
      assert.equal(validate({
        name: 'person',
        pagination: {
          enabled: true,
          default_page_size: 10,
          default_page_number: 3,
          hungry: true
        }
      }), false);
    });
  });

  describe('actions', () => {
    it('should return true when an object of the right form is passed', () => {
      assert.equal(validate({
        name: 'person',
        actions: {
          create: true,
          read_one: false,
          read_many: false,
          update: false,
          delete: true
        }
      }), true);

      assert.equal(validate({
        name: 'person',
        actions: {
          create: true,
          delete: true
        }
      }), true);
    });

    it('should return false when unrecognized properties exist', () => {
      assert.equal(validate({
        name: 'person',
        actions: {
          create: true,
          deletePls: true
        }
      }), false);
    });

    it('should return false when not an object', () => {
      assert.equal(validate({
        name: 'person',
        actions: true
      }), false);

      assert.equal(validate({
        name: 'person',
        actions: 'asdf'
      }), false);

      assert.equal(validate({
        name: 'person',
        actions: 234
      }), false);
    });
  });

  describe('built_in_meta', () => {
    it('should return true when an object of the right form is passed', () => {
      assert.equal(validate({
        name: 'person',
        built_in_meta: {
          created_at: true,
          updated_at: false
        }
      }), true);

      assert.equal(validate({
        name: 'person',
        built_in_meta: {
          created_at: true
        }
      }), true);
    });

    it('should return false when unrecognized properties exist', () => {
      assert.equal(validate({
        name: 'person',
        built_in_meta: {
          created_at: true,
          sandwiches: true
        }
      }), false);
    });

    it('should return false when not an object', () => {
      assert.equal(validate({
        name: 'person',
        built_in_meta: true
      }), false);

      assert.equal(validate({
        name: 'person',
        built_in_meta: 'asdf'
      }), false);

      assert.equal(validate({
        name: 'person',
        built_in_meta: 234
      }), false);
    });
  });

  describe('attributes', () => {
    it('should accept a shorthand for attributes', () => {
      assert.equal(validate({
        name: 'person',
        attributes: {
          first_name: 'VARCHAR(30)',
          last_name: 'VARCHAR(30)'
        }
      }), true);
    });

    it('should accept an object form for attributes', () => {
      assert.equal(validate({
        name: 'person',
        attributes: {
          first_name: {
            type: 'VARCHAR(30)',
            nullable: true,
            default: 'what'
          },
          last_name: 'VARCHAR(30)'
        }
      }), true);
    });

    it('should fail if there are unrecognized properties', () => {
      assert.equal(validate({
        name: 'person',
        attributes: {
          first_name: {
            type: 'VARCHAR(30)',
            nullable: true,
            default: 'what',
            hungry: true
          },
          last_name: 'VARCHAR(30)'
        }
      }), false);
    });

    it('should fail if shorthand is not a string', () => {
      assert.equal(validate({
        name: 'person',
        attributes: {
          last_name: true
        }
      }), false);

      assert.equal(validate({
        name: 'person',
        attributes: {
          last_name: 234
        }
      }), false);
    });
  });

  describe('meta', () => {
    it('should accept a shorthand for meta', () => {
      assert.equal(validate({
        name: 'person',
        meta: {
          copyright: 'VARCHAR(30)',
          license: 'VARCHAR(30)'
        }
      }), true);
    });

    it('should accept an object form for meta', () => {
      assert.equal(validate({
        name: 'person',
        meta: {
          copyright: {
            type: 'VARCHAR(30)',
            nullable: true,
            default: 'what'
          },
          license: 'VARCHAR(30)'
        }
      }), true);
    });

    it('should fail if there are unrecognized properties', () => {
      assert.equal(validate({
        name: 'person',
        meta: {
          copyright: {
            type: 'VARCHAR(30)',
            nullable: true,
            default: 'what',
            hungry: true
          },
          license: 'VARCHAR(30)'
        }
      }), false);
    });

    it('should fail if shorthand is not a string', () => {
      assert.equal(validate({
        name: 'person',
        meta: {
          license: true
        }
      }), false);

      assert.equal(validate({
        name: 'person',
        meta: {
          license: 234
        }
      }), false);
    });
  });

  describe('relationships', () => {
    it('should accept a string shorthand form', () => {
      assert.equal(validate({
        name: 'person',
        relationships: {
          club: 'many-to-one',
          secret_heirloom: 'one-to-one',
          clothes: 'many-to-many'
        }
      }), true);
    });

    it('should accept an object form for meta', () => {
      assert.equal(validate({
        name: 'person',
        relationships: {
          club: {
            resource: 'clubs',
            cardinality: 'one-to-one'
          },
          secret_heirloom: 'many-to-one'
        }
      }), true);
    });

    it('should fail if there are unrecognized properties', () => {
      assert.equal(validate({
        name: 'person',
        relationships: {
          club: {
            resource: 'clubs',
            relationship: 'one-to-one',
            hungry: true
          },
          license: 'many-to-uno'
        }
      }), false);
    });

    it('should fail if shorthand is not a string', () => {
      assert.equal(validate({
        name: 'person',
        relationships: {
          license: true
        }
      }), false);

      assert.equal(validate({
        name: 'person',
        relationships: {
          license: 234
        }
      }), false);
    });

    it('should fail if shorthand is not a valid relationship type', () => {
      assert.equal(validate({
        name: 'person',
        relationships: {
          license: 'uno-to-many'
        }
      }), false);

      assert.equal(validate({
        name: 'person',
        relationships: {
          license: 'what'
        }
      }), false);

      assert.equal(validate({
        name: 'person',
        relationships: {
          club: {
            resource: 'clubs',
            cardinality: 'ok'
          },
          secret_heirloom: 'many-to-one'
        }
      }), false);
    });
  });
});
