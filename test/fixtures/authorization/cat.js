module.exports = {
  name: 'cat',
  attributes: {
    first_name: {
      type: 'VARCHAR(30)',
      nullable: false
    },
    last_name: 'VARCHAR(30)'
  },
  built_in_meta: {
    created_at: false,
    updated_at: false
  },
  is_authorized({crudAction}) {
    return crudAction !== 'readOne';
  }
};
