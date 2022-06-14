import { buildCustomEventsMapper } from '../utils';

describe('utils', () => {
  it('buildCustomEventsMapper should return a merged mapped object', () => {
    const key = 'properties';
    const integrationOptions = { [key]: { bar: 'biz' } };

    const mapper = buildCustomEventsMapper(integrationOptions, key);

    expect(mapper).toMatchObject({
      ...integrationOptions[key],
    });

    expect(mapper).not.toBe(integrationOptions[key]);
  });
});
