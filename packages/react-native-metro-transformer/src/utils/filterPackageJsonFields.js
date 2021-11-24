const { Buffer } = require('buffer');

/**
 * Filters the passed in package.json data to return only
 * the name and version fields.
 *
 * @param {Buffer} data - Buffer containing the package.json data. Provided by metro when bundling.
 *
 * @returns {Buffer} Buffer containing only the name and version fields from package.json.
 */
function filterPackageJsonFields(data) {
  const sourceCodeString = data.toString('utf8');

  const sourceCodeParsed = JSON.parse(sourceCodeString);

  const newSourceCodeString = JSON.stringify({
    name: sourceCodeParsed.name,
    version: sourceCodeParsed.version,
  });

  return Buffer.from(newSourceCodeString);
}

module.exports = filterPackageJsonFields;
