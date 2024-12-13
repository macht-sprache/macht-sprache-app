import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import React from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { langA, langB } from '../languages';
import translationLangA from './a/translation.json';
import translationLangB from './b/translation.json';

export const resources = {
    [langA]: {
        translation: translationLangA,
    },
    [langB]: {
        translation: translationLangB,
    },
} as const;

i18n.use(initReactI18next)
    .use(LanguageDetector)
    .init({
        fallbackLng: langA,
        resources,
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
        react: {
            useSuspense: false,
        },
        interpolation: {
            escapeValue: false,
        },
    });

export const TranslationProvider = ({ children }: { children: React.ReactNode }) => (
    // @ts-ignore
    <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
);

export { i18n };
