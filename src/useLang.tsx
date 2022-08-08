import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from './hooks/appContext';
import { useOptionalFirebaseAuth } from './hooks/auth';
import { collections } from './hooks/data';
import { i18n } from './i18n/config';
import { langA, langB } from './languages';
import { Lang } from './types';

const languages: Lang[] = [langA, langB];

export const toLanguageOrDefault = (lang: string) => languages.find(l => l === lang) ?? langA;

type LangContextValue = { lang: Lang; setLang: (newLang: Lang) => void };

const langContext = createContext<LangContextValue>({ lang: langA, setLang: () => {} });

const useLangContext = (): LangContextValue => {
    const auth = useOptionalFirebaseAuth();
    const { i18n } = useTranslation();
    const [i18nLang, set18nLang] = useState(i18n.language);
    const { user, userSettings } = useAppContext();
    const userLang = user && userSettings?.lang;
    const lang = userLang ?? toLanguageOrDefault(i18nLang);

    useEffect(() => {
        i18n.on('languageChanged', set18nLang);
        return () => i18n.off('languageChanged', set18nLang);
    }, [i18n]);

    useEffect(() => {
        if (userLang && userLang !== i18nLang) {
            i18n.changeLanguage(userLang);
        }
    }, [i18n, i18nLang, userLang]);

    useEffect(() => {
        document.documentElement.setAttribute('lang', lang);
        if (auth) {
            auth.languageCode = lang;
        }
    }, [auth, lang]);

    const setLang = useCallback(
        (newLang: Lang) => {
            if (user && userSettings) {
                collections.userSettings.doc(user.id).update({ lang: newLang });
            } else {
                i18n.changeLanguage(newLang);
            }
        },
        [i18n, user, userSettings]
    );

    return { lang, setLang };
};

export const LangProvider: React.FC = ({ children }) => {
    const value = useLangContext();
    return <langContext.Provider value={value}>{children}</langContext.Provider>;
};

export const PageLangProvider: React.FC = ({ children }) => {
    const pageLang = document.documentElement.lang;
    const value = useMemo<LangContextValue>(() => ({ lang: toLanguageOrDefault(pageLang), setLang: () => {} }), [
        pageLang,
    ]);

    useEffect(() => {
        i18n.changeLanguage(value.lang);
    }, [value.lang]);

    return <langContext.Provider value={value}>{children}</langContext.Provider>;
};

export const useLang = () => {
    const { lang, setLang } = useContext(langContext);
    return [lang, setLang] as const;
};
