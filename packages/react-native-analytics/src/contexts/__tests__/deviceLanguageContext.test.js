import deviceLanguageContext from '../deviceLanguageContext';
import { NativeModules, Platform } from 'react-native';

describe('deviceLanguageContext', () => {
  describe('iOS platform', () => {
    beforeAll(() => {
      Platform.OS = 'ios';
    });

    it('Should use the AppleLocale value if available as the value for deviceLanguage', () => {
      const expectedContext = {
        deviceLanguage: NativeModules.SettingsManager.settings.AppleLocale,
      };

      const context = deviceLanguageContext();

      expect(context).toStrictEqual(expectedContext);
    });

    it('Should use the AppleLanguages array if AppleLocale is not available as the value for the deviceLanguage', () => {
      //Remove AppleLocale from settings.
      delete NativeModules.SettingsManager.settings.AppleLocale;

      const expectedContext = {
        deviceLanguage:
          NativeModules.SettingsManager.settings.AppleLanguages[0],
      };

      const context = deviceLanguageContext();

      expect(context).toStrictEqual(expectedContext);
    });

    it('Should return a default value if no language was found on the device', () => {
      //Remove AppleLanguages to trigger the default case
      delete NativeModules.SettingsManager.settings.AppleLanguages;

      const expectedContext = {
        deviceLanguage: 'en',
      };

      const context = deviceLanguageContext();

      expect(context).toStrictEqual(expectedContext);
    });
  });

  describe('Android platform', () => {
    beforeAll(() => {
      Platform.OS = 'android';
    });

    it('Should use the NativeModules.I18nManager.localeIdentifier as the value for the deviceLanguage', () => {
      const expectedContext = {
        deviceLanguage: NativeModules.I18nManager.localeIdentifier,
      };

      const context = deviceLanguageContext();

      expect(context).toStrictEqual(expectedContext);
    });

    it('Should return a default value if no language was found on the device', () => {
      //Remove localeIdentifier to trigger the default case
      delete NativeModules.I18nManager.localeIdentifier;

      const expectedContext = {
        deviceLanguage: 'en',
      };

      const context = deviceLanguageContext();

      expect(context).toStrictEqual(expectedContext);
    });
  });
});
