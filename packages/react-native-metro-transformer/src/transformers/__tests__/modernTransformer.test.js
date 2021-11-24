const modernTransformer = require('../modernTransformer');
const { Buffer } = require('buffer');

const UpstreamTransformer = require('metro-transform-worker');

UpstreamTransformer.transform = jest.fn();

describe('modernTransformer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should export an object containing all properties from the upstream transformer object and overrides the transform function', () => {
    expect(modernTransformer).toMatchObject({
      ...UpstreamTransformer,
      transform: expect.any(Function),
    });
  });

  it('Should filter data before calling upstream transformer when the file to transform is a package.json file', () => {
    const mockTransformerConfig = {};
    const mockProjectRoot = 'my_project/';
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

    modernTransformer.transform(
      mockTransformerConfig,
      mockProjectRoot,
      mockFilename,
      mockData,
      mockTransformOptions,
    );

    expect(UpstreamTransformer.transform).toHaveBeenCalledWith(
      mockTransformerConfig,
      mockProjectRoot,
      mockFilename,
      expectedData,
      mockTransformOptions,
    );
  });

  it('Should not filter data before calling upstream transformer when the file to transform is not a package.json file', () => {
    const mockTransformerConfig = {};
    const mockProjectRoot = 'my_project/';
    let mockFilename = 'myModule/another.json';
    let dummyFileContentsValue = {
      dummy: 'value',
      another: 'test',
    };
    const mockTransformOptions = { minify: true };

    let mockData = Buffer.from(JSON.stringify(dummyFileContentsValue));

    modernTransformer.transform(
      mockTransformerConfig,
      mockProjectRoot,
      mockFilename,
      mockData,
      mockTransformOptions,
    );

    expect(UpstreamTransformer.transform).toHaveBeenLastCalledWith(
      mockTransformerConfig,
      mockProjectRoot,
      mockFilename,
      mockData,
      mockTransformOptions,
    );

    mockFilename = 'myModule/MyComponent.js';

    dummyFileContentsValue =
      'import react from "react"; export default class MyComponent extends React.Component {};';

    mockData = Buffer.from(dummyFileContentsValue);

    modernTransformer.transform(
      mockTransformerConfig,
      mockProjectRoot,
      mockFilename,
      mockData,
      mockTransformOptions,
    );

    expect(UpstreamTransformer.transform).toHaveBeenLastCalledWith(
      mockTransformerConfig,
      mockProjectRoot,
      mockFilename,
      mockData,
      mockTransformOptions,
    );
  });

  it('Should throw an error if the upstream transformer is not of the expected type', () => {
    jest.doMock('metro-transform-worker', () => {
      return () => {};
    });

    jest.resetModules();

    expect(() => require('../modernTransformer')).toThrow(
      'Invalid value received for upstream transformer. This version of metro is not supported by this package.',
    );
  });
});
