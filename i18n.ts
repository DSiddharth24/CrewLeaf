import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './locales/en.json';
import kn from './locales/kn.json';
import hi from './locales/hi.json';
import tuu from './locales/tuu.json';

// Language detection
const languageDetector = {
    type: 'languageDetector',
    async: true,
    detect: async (callback: (lang: string) => void) => {
        const savedLanguage = await AsyncStorage.getItem('user-language');
        callback(savedLanguage || 'en');
    },
    init: () => { },
    cacheUserLanguage: async (language: string) => {
        await AsyncStorage.setItem('user-language', language);
    },
};

i18n
    .use(languageDetector as any)
    .use(initReactI18next)
    .init({
        compatibilityJSON: 'v4',
        resources: {
            en: en,
            kn: kn,
            hi: hi,
            tuu: tuu,
        },
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
