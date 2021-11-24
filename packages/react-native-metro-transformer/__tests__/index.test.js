const legacyTransformer = require('../src/transformers/legacyTransformer');
const modernTransformer = require('../src/transformers/modernTransformer');

let mockLegacyTransformer;

jest.mock('../src/transformers/legacyTransformer', () => {
  if (!mockLegacyTransformer) {
    mockLegacyTransformer = jest.fn();
  }
});

let mockModernTransformer;

jest.mock('../src/transformers/modernTransformer', () => {
  if (!mockModernTransformer) {
    mockModernTransformer = jest.fn();
  }
});

describe('react-native-metro-transformer', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('Should return legacy transformer if metro package version is less than 0.60', () => {
    jest.doMock('metro/package.json', () => {
      return { version: '0.59.0' };
    });

    require('metro/package.json');

    const returnedValue = require('..');

    expect(returnedValue).toBe(legacyTransformer);
  });

  it('Should return modern transformer if metro package version is greater or equal than 0.60', () => {
    jest.doMock('metro/package.json', () => {
      return { version: '0.60.0' };
    });

    require('metro/package.json');

    const returnedValue = require('..');

    expect(returnedValue).toBe(modernTransformer);
  });
});
