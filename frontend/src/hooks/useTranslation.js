import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

export const useAppTranslation = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = useCallback((lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('gramaai-language', lang);
  }, [i18n]);

  const currentLanguage = i18n.language;

  const getLanguageName = useCallback((code) => {
    const names = {
      en: 'English',
      hi: 'हिन्दी',
      kn: 'ಕನ್ನಡ',
    };
    return names[code] || code;
  }, []);

  const getSpeechLanguage = useCallback((code) => {
    const speechLangs = {
      en: 'en-IN',
      hi: 'hi-IN',
      kn: 'kn-IN',
    };
    return speechLangs[code] || 'en-IN';
  }, []);

  return {
    t,
    i18n,
    currentLanguage,
    changeLanguage,
    getLanguageName,
    getSpeechLanguage,
    languages: [
      { code: 'en', name: 'English' },
      { code: 'hi', name: 'हिन्दी' },
      { code: 'kn', name: 'ಕನ್ನಡ' },
    ],
  };
};
