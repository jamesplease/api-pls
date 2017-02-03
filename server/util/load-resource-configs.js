module.exports = function() {
  const cwd = process.cwd();
  const resourceDefinitions = process.argv[2];

  let resources = [];
  try {
    resources = JSON.parse(resourceDefinitions);
  } catch(e) {
    // Intentionally blank
  }

  return resources;
}
