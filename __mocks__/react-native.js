export const NativeModules = {
  SettingsManager: {
    settings: {
      AppleLocale: 'en',
      AppleLanguages: ['pt-PT', 'en'],
    },
  },
  I18nManager: {
    localeIdentifier: 'en',
  },
};

export const Platform = {
  OS: 'ios',
};

export const Dimensions = {
  get: dim => {
    if (dim === 'window') {
      return {
        width: 800,
        height: 1000,
      };
    }

    if (dim === 'screen') {
      return {
        width: 800,
        height: 1100,
      };
    }
  },
};
