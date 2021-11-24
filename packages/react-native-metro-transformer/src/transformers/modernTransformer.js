/**
 * Transformer to be used in React Native versions greater than 0.59
 */

const filterPackageJsonFields = require('../utils/filterPackageJsonFields');

// Default transformer used by metro.
const UpstreamTransformer = require('metro-transform-worker');

if (!UpstreamTransformer || typeof UpstreamTransformer !== 'object') {
  throw new Error(
    'Invalid value received for upstream transformer. This version of metro is not supported by this package.',
  );
}

// Metro is expecting an object with a transform method in versions greater than 0.59.
module.exports = {
  ...UpstreamTransformer,
  /**
   * Transforms the passed in file. If it is a package.json file, it will remove
   * all fields except 'name' and 'version' before passing to the upstream
   * transformer.
   *
   * @param {object} transformerConfig - Transformer configuration defined in metro.
   * @param {string} projectRoot - Project root path.
   * @param {string} filename - The filename to be transformed.
   * @param {Buffer} data - Buffer containing the filename contents. It is assumed to be encoded in UTF-8.
   * @param {object} transformOptions - Transform options defined in metro.
   *
   * @returns {object} An object containing the transformation result. Can contain an Abstract Syntax Tree or not depending on the file type.
   */
  transform(transformerConfig, projectRoot, filename, data, transformOptions) {
    let finalData = data;

    // For package.json files, we filter
    // all fields, except 'name' and 'version'
    // before passing to the upstream transformer.
    if (filename.endsWith('package.json')) {
      finalData = filterPackageJsonFields(finalData);
    }

    // Then delegate the result to the upstream transformer.
    return UpstreamTransformer.transform(
      transformerConfig,
      projectRoot,
      filename,
      finalData,
      transformOptions,
    );
  },
};
