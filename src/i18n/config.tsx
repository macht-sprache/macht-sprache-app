import i18n from 'i18next';
import translationLangA from './a/translation.json';
import translationLangB from './b/translation.json';
import { initReactI18next, I18nextProvider } from 'react-i18next';
import { langA, langB } from '../languages';

export const resources = {
    [langA]: {
        translation: translationLangA,
    },
    [langB]: {
        translation: translationLangB,
    },
} as const;

i18n.use(initReactI18next).init({
    lng: langA,
    resources,
    react: {
        useSuspense: false,
    },
});

export const TranslationProvider: React.FC = ({ children }) => (
    <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
);
