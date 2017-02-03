const requireId = {
  anyOf: [
    {type: 'integer'},
    {
      type: 'string',
      pattern: '^[0-9]+$'
    }
  ],
  required: true
};

module.exports = {
  create: {},
  readOne: {
    type: 'object',
    required: true,
    properties: {
      type: 'object',
      required: true,
      params: {
        properties: {
          id: requireId
        }
      }
    }
  },
  readMany: {},
  update: {},
  delete: {}
};
