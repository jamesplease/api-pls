const sqlUtil = require('../../../../packages/api-pls-postgres-adapter/sql/sql-util');

describe('sqlUtil', function() {
  beforeEach(() => {
    this.resource = {
      name: 'sandwiches";'
    };

    this.oneToOneRelationship = {
      name: 'ring',
      resource: 'jewelry',
      cardinality: 'one-to-one'
    };

    this.oneToManyRelationship = {
      name: 'owner',
      resource: 'person',
      cardinality: 'one-to-many'
    };
  });

  describe('getTableName', () => {
    it('should return the unescaped name', () => {
      assert.equal(sqlUtil.getTableName(this.resource), 'sandwiches";');
    });

    it('should return the escaped name', () => {
      assert.equal(sqlUtil.getTableName(this.resource, {escaped: true}), '"sandwiches"";"');
    });
  });

  describe('getIdColumnFromResource', () => {
    it('should return the unescaped name', () => {
      assert.equal(sqlUtil.getIdColumnFromResource(this.resource), 'id');
    });

    it('should return the escaped name', () => {
      assert.equal(sqlUtil.getIdColumnFromResource(this.resource, {escaped: true}), '"id"');
    });
  });

  describe('getIdSuffix', () => {
    it('should return the right toMany suffix', () => {
      assert.equal(sqlUtil.getIdSuffix(this.oneToManyRelationship), 'ids');
    });

    it('should return the right not-toMany suffix', () => {
      assert.equal(sqlUtil.getIdSuffix(this.oneToOneRelationship), 'id');
    });
  });

  describe('getRelationshipColumnName', () => {
    it('should return the right column name', () => {
      assert.equal(sqlUtil.getRelationshipColumnName(this.oneToManyRelationship), 'owner_ids');
    });

    it('should return the right escaped column name', () => {
      assert.equal(sqlUtil.getRelationshipColumnName(this.oneToManyRelationship, {escaped: true}), '"owner_ids"');
    });
  });

  describe('getVirtualHostTableName', () => {
    it('should return the right temporary table name', () => {
      assert.equal(sqlUtil.getVirtualHostTableName(this.oneToManyRelationship), 'related_person_ids');
    });

    it('should return the right escaped temporary table name', () => {
      assert.equal(sqlUtil.getVirtualHostTableName(this.oneToManyRelationship, {escaped: true}), '"related_person_ids"');
    });
  });
});
