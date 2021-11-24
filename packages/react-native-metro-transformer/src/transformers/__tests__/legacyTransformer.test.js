const legacyTransformer = require('../legacyTransformer');
const { Buffer } = require('buffer');

const UpstreamTransformer = require('metro/src/JSTransformer/worker');

UpstreamTransformer.prototype.transform = jest.fn();

describe('legacyTransformer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should export a constructor function that creates instance of upstream transformer', () => {
    expect(legacyTransformer).toBeInstanceOf(Function);

    const transformerInstance = new legacyTransformer();

    expect(transformerInstance).toBeInstanceOf(UpstreamTransformer);

    expect(transformerInstance).toHaveProperty('transform');
  });

  it('Should filter data before calling upstream transformer when the file to transform is a package.json file', () => {
    const transformerInstance = new legacyTransformer();

    const mockFilename = 'myModule/package.json';
    const dummyPackageJsonValue = {
      name: 'myModule',
      version: '1.0.0',
      dependencies: { 'dummy-dependency': '~0.1.0' },
      repository: {
        type: 'git',
        url: 'git@gitrepository:myModule',
      },
    };
    const mockTransformOptions = { minify: true };

    const mockData = Buffer.from(JSON.stringify(dummyPackageJsonValue));

    const expectedData = Buffer.from(
      JSON.stringify({
        name: dummyPackageJsonValue.name,
        version: dummyPackageJsonValue.version,
      }),
    );

    transformerInstance.transform(mockFilename, mockData, mockTransformOptions);

    expect(UpstreamTransformer.prototype.transform).toHaveBeenCalledWith(
      mockFilename,
      expectedData,
      mockTransformOptions,
    );
  });

  it('Should not filter data before calling upstream transformer when the file to transform is not a package.json file', () => {
    const transformerInstance = new legacyTransformer();

    let mockFilename = 'myModule/another.json';
    let dummyFileContentsValue = {
      dummy: 'value',
      another: 'test',
    };
    const mockTransformOptions = { minify: true };

    let mockData = Buffer.from(JSON.stringify(dummyFileContentsValue));

    transformerInstance.transform(mockFilename, mockData, mockTransformOptions);

    expect(UpstreamTransformer.prototype.transform).toHaveBeenLastCalledWith(
      mockFilename,
      mockData,
      mockTransformOptions,
    );

    mockFilename = 'myModule/MyComponent.js';

    dummyFileContentsValue =
      'import react from "react"; export default class MyComponent extends React.Component {};';

    mockData = Buffer.from(dummyFileContentsValue);

    transformerInstance.transform(mockFilename, mockData, mockTransformOptions);

    expect(UpstreamTransformer.prototype.transform).toHaveBeenLastCalledWith(
      mockFilename,
      mockData,
      mockTransformOptions,
    );
  });

  it('Should throw an error if the upstream transformer is not of the expected type', () => {
    jest.doMock('metro/src/JSTransformer/worker', () => {
      return {};
    });

    jest.resetModules();

    expect(() => require('../legacyTransformer')).toThrow(
      'Invalid value received for upstream transformer. This version of metro is not supported by this package.',
    );
  });
});
