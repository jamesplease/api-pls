'use strict';

module.exports = function() {
  const resourceDefinitions = process.argv[2];

  let resources = [];
  try {
    resources = JSON.parse(resourceDefinitions);
  } catch (e) {
    // Intentionally blank
  }

  return resources;
};
