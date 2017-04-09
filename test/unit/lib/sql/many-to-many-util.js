const manyToManyUtil = require('../../../../packages/api-pls-postgres-adapter/sql/many-to-many-util');

describe('manyToManyUtil', function() {
  beforeEach(() => {
    this.host = {
      name: 'cat'
    };

    this.guest = {
      name: 'person'
    };
  });

  describe('getAssociativeTableName', () => {
    it('should return the raw name', () => {
      const result = manyToManyUtil.getAssociativeTableName({
        host: this.host,
        guest: this.guest
      });

      assert.equal(result, 'cat_person');
    });

    it('should return the escaped name', () => {
      const result = manyToManyUtil.getAssociativeTableName({
        host: this.host,
        guest: this.guest,
        escaped: true
      });

      assert.equal(result, '"cat_person"');
    });
  });

  describe('getHostIdColumnName', () => {
    it('should return the raw name', () => {
      const result = manyToManyUtil.getHostIdColumnName({
        host: this.host
      });

      assert.equal(result, 'cat_id');
    });

    it('should return the escaped name', () => {
      const result = manyToManyUtil.getHostIdColumnName({
        host: this.host,
        escaped: true
      });

      assert.equal(result, '"cat_id"');
    });
  });

  describe('getGuestIdColumnName', () => {
    it('should return the raw name', () => {
      const result = manyToManyUtil.getGuestIdColumnName({
        guest: this.guest
      });

      assert.equal(result, 'person_id');
    });

    it('should return the escaped name', () => {
      const result = manyToManyUtil.getGuestIdColumnName({
        guest: this.guest,
        escaped: true
      });

      assert.equal(result, '"person_id"');
    });
  });

  describe('getPrimaryKeyColumnName', () => {
    it('should return the raw name', () => {
      const result = manyToManyUtil.getPrimaryKeyColumnName({
        host: this.host,
        guest: this.guest
      });

      assert.equal(result, 'cat_person_pkey');
    });

    it('should return the escaped name', () => {
      const result = manyToManyUtil.getPrimaryKeyColumnName({
        host: this.host,
        guest: this.guest,
        escaped: true
      });

      assert.equal(result, '"cat_person_pkey"');
    });
  });
});
