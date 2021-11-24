import { NativeModules, Platform } from 'react-native';

/**
 * Obtains the device language for iOS and Android platforms
 * and returns a default language when not available.
 *
 * @returns {String} - The language of the operating system on the device or 'en' as default value if no value was found on the device
 */
function getDeviceLocale() {
  let locale;

  if (Platform.OS === 'ios') {
    locale = NativeModules.SettingsManager.settings.AppleLocale;

    if (locale === undefined) {
      // iOS 13 workaround, take first of AppleLanguages array  ["en", "en-NZ"]
      const appleLanguages =
        NativeModules.SettingsManager.settings.AppleLanguages;

      if (appleLanguages && appleLanguages.length) {
        locale = NativeModules.SettingsManager.settings.AppleLanguages[0];
      }

      if (locale) {
        return locale;
      }
    }
  }

  if (Platform.OS === 'android') {
    locale = NativeModules.I18nManager.localeIdentifier;

    if (locale) {
      return locale;
    }
  }

  //Return en by default if no language was obtained
  return 'en';
}

/**
 * Function that adds a deviceLanguage property with the language of the operating system of the device
 * to be used on analytics.useContext method.
 *
 * @returns {Object} - An object with a key 'deviceLanguage' that corresponds to the language of the operating system of the device or 'en' if not found.
 */
export default function deviceLanguageContext() {
  return {
    deviceLanguage: getDeviceLocale(),
  };
}
