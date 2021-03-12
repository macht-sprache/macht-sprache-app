import i18next from 'i18next';
import { langA, langB } from '../../../src/languages';
import { Lang, LangA } from '../../../src/types';
import localeLangA from './localeLangA.json';
import localeLangB from './localeLangB.json';

const resources = {
    [langA]: {
        translation: localeLangA,
    },
    [langB]: {
        translation: localeLangB,
    },
};

type Resource = typeof resources[LangA];
type TKey<T extends Record<string, unknown>> = {
    // @ts-ignore
    [key in keyof T]: T[key] extends Record<string, unknown> ? `${string & key}.${string & TKey<T[key]>}` : key;
}[keyof T];
type TransKey = TKey<Resource>;

declare module 'i18next' {
    type DefaultResources = typeof resources[LangA];
    interface Resources extends DefaultResources {}
}

i18next.init({
    resources,
});

export const translate = (lang: Lang) => (key: TransKey) => i18next.t(key, { lng: lang });
