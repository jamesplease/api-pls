'use strict';

module.exports = {
  // Returned anytime a request is made against a nonexistent resource.
  // For instance, if the user typos the URL, or if the resource has been
  // deleted.
  notFound: {
    code: 404,
    body() {
      return {
        title: 'Resource Not Found',
        detail: 'The requested resource does not exist.'
      };
    }
  },

  // Returned if the resource does not permit this operation. For instance,
  // trying to DELETE a resource that is read-only.
  notAllowed: {
    code: 405,
    body() {
      return {
        title: 'Method Not Allowed',
        detail: 'This method is not permitted on this resource.'
      };
    }
  },

  // Returned in several situations involving bad formatting, typos, or
  // other mistakes from the requestor:
  // - sparse fieldset is requested, in which none of the fields
  //   are valid.
  // - the user forgets to nest their data under "data"
  noValidFields: {
    code: 400,
    body(resourceName) {
      return {
        title: 'Bad Request',
        detail: `No valid fields were specified for resource "${resourceName}".`
      };
    }
  },

  // Returned when the client specifies an invalid Content-Type header. For
  // more, see: http://jsonapi.org/format/#content-negotiation-servers
  contentTypeHasParams: {
    code: 415,
    body() {
      return {
        title: 'Invalid Content-Type Header',
        detail: 'The header "Content-Type: application/vnd.api+json" cannot have media type parameters.'
      };
    }
  },

  // Returned when the client specifies an invalid Accepts header. For more, see:
  // http://jsonapi.org/format/#content-negotiation-servers
  acceptsHasParams: {
    code: 406,
    body() {
      return {
        title: 'Invalid Accepts Header',
        detail: 'No instances of the JSON API media type in the Accepts header were specified without media type parameters.'
      };
    }
  },

  // A catch-all for server errors that aren't handled more gracefully.
  generic: {
    code: 500,
    body() {
      return {
        title: 'Server Error',
        detail: 'The server encounted an error while processing your request'
      };
    }
  }
};
