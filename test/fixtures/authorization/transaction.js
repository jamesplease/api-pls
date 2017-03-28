module.exports = {
  name: 'transaction',
  attributes: {
    label: {
      type: 'VARCHAR(30)',
      nullable: false
    },
    user_id: {
      type: 'VARCHAR(30)',
      nullable: false
    }
  },
  built_in_meta: {
    created_at: false,
    updated_at: false
  },
  additional_condition() {
    return "user_id='2'";
  }
};
