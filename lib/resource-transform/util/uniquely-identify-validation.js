const requireId = require('./require-id-validation');

// This is useful for uniquely identifying a single instance of the resource.
// It requires that an `id` be passed in through URL params.
module.exports = {
  type: 'object',
  // This is required because an `id` from `params` is necessary to determine
  // which object to delete. Without that, you're not specifying anything!
  required: true,
  properties: {
    // Only `params` is needed – not body – to get the `id`
    params: {
      type: 'object',
      required: true,
      properties: {
        id: requireId
      }
    }
  }
};
