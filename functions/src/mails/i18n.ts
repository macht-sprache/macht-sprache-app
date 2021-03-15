import i18next from 'i18next';
import { langA, langB } from '../../../src/languages';
import { Lang } from '../../../src/types';
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

type Resource = typeof localeLangA;
type TKey<T extends Record<string, unknown>> = {
    // @ts-ignore
    [key in keyof T]: T[key] extends Record<string, unknown> ? `${string & key}.${string & TKey<T[key]>}` : key;
}[keyof T];
type TransKey = TKey<Resource>;

i18next.init({
    resources,
});

export const translate = (lang: Lang) => (key: TransKey, interpolationMap: Record<string, string> = {}) =>
    i18next.t(key, { lng: lang, ...interpolationMap });
