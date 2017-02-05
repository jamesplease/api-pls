'use strict';

module.exports = function(message, options, details) {
  // In silent mode, nothing is logged.
  if (options.silent) {
    return;
  }

  // In regular mode, we log the basic information.
  if (message) {
    console.log(message);
  }

  // In verbose mode, we add in details.
  if (options.verbose && details) {
    console.log(details);
  }
};
