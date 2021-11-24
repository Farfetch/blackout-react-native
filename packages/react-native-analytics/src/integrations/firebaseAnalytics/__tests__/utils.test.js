import { buildMapper, formatEvent, formatUserTraits } from '../utils';
import { utils } from '@farfetch/blackout-core/analytics';

jest.mock('@farfetch/blackout-core/analytics', () => ({
  ...jest.requireActual('@farfetch/blackout-core/analytics'),
  utils: {
    logger: {
      error: jest.fn(),
    },
  },
}));

describe('utils', () => {
  it('buildMapper should return a merged mapped object', () => {
    const key = 'properties';
    const integrationOptions = { [key]: { bar: 'biz' } };
    const defaultMapper = { foo: 'bar' };

    expect(buildMapper(integrationOptions, defaultMapper, key)).toMatchObject({
      ...defaultMapper,
      ...integrationOptions[key],
    });
  });

  it('formatEvent should properly format a string for a firebaseAnalytics event', () => {
    expect(formatEvent('My event')).toEqual('my_event');
    expect(formatEvent('My-event')).toEqual('my_event');
    expect(formatEvent()).toEqual('');
  });

  it('formatUserTraits should properly format the user traits object', () => {
    const loggerErrorSpy = jest.spyOn(utils.logger, 'error');
    const traits = {
      email: 'asd@asd.asd',
      name: 'foo',
      genderId: 0,
      isGuest: false,
      moreData: {},
    };

    expect(formatUserTraits(traits)).toMatchObject({
      email: traits.email,
      name: traits.name,
      genderId: traits.genderId.toString(),
      isGuest: traits.isGuest.toString(),
    });

    expect(loggerErrorSpy).toHaveBeenCalled();
  });
});
