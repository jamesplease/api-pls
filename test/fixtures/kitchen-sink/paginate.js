module.exports = {
  name: 'paginate',
  pagination: {
    default_page_size: 2
  },
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
  }
};
