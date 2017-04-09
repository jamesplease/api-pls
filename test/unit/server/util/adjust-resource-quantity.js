const adjustResourceQuantity = require('../../../../packages/api-pls-express-router/util/adjust-resource-quantity');

adjustResourceQuantity.setResources([
  {name: 'cat', plural_form: 'cats'},
  {name: 'person', plural_form: 'people'},
]);

describe('adjustResourceQuantity', function() {
  describe('when requesting singular', () => {
    it('should return the plural form', () => {
      assert.equal(adjustResourceQuantity.getPluralName('cat'), 'cats');
    });
  });

  describe('when requesting plural', () => {
    it('should return the single form', () => {
      assert.equal(adjustResourceQuantity.getSingularName('people'), 'person');
    });
  });
});
