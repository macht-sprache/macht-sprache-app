import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { auth } from './firebase';
import { useUser } from './hooks/auth';
import { collections } from './hooks/data';
import { langA, langB } from './languages';
import { Lang } from './types';

const languages: Lang[] = [langA, langB];

export const toLanguageOrDefault = (lang: string) => languages.find(l => l === lang) ?? langA;

type LangContextValue = { lang: Lang; setLang: (newLang: Lang) => void };

const langContext = createContext<LangContextValue>({ lang: langA, setLang: () => {} });

const useLangContext = (): LangContextValue => {
    const { i18n } = useTranslation();
    const [i18nLang, set18nLang] = useState(i18n.language);
    const user = useUser();
    const userLang = user?.lang;
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
        auth.languageCode = lang;
    }, [lang]);

    const setLang = useCallback(
        (newLang: Lang) => {
            if (user) {
                collections.users.doc(user.id).update({ lang: newLang });
            } else {
                i18n.changeLanguage(newLang);
            }
        },
        [i18n, user]
    );

    return { lang, setLang };
};

export const LangProvider: React.FC = ({ children }) => {
    const value = useLangContext();
    return <langContext.Provider value={value}>{children}</langContext.Provider>;
};

export const useLang = () => {
    const { lang, setLang } = useContext(langContext);
    return [lang, setLang] as const;
};
