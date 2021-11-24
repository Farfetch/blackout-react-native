var semver = require('semver');
var { version } = require('metro/package.json');

if (semver.satisfies(version, '>= 0.60.0')) {
  module.exports = require('./src/transformers/modernTransformer');
} else {
  module.exports = require('./src/transformers/legacyTransformer');
}
