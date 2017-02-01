// This is the definition for the default ID
export default {
  anyOf: [
    {type: 'integer'},
    {
      type: 'string',
      pattern: '^[0-9]+$'
    }
  ],
  required: true
};
