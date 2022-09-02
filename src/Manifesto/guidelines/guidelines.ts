import React from 'react';
import { langA, langB } from '../../languages';
import { Lang } from '../../types';
import { useLang } from '../../useLang';
import { MdxLinkBaseProvider } from '../../components/MdxWrapper/mdxComponents';
import { MANIFESTO } from '../../routes';

type GuidelineContent = {
    default: React.ComponentType;
    title: string;
    intro?: string;
};

type GuidelineInternal = {
    id: string;
    [langA]: () => Promise<GuidelineContent>;
    [langB]: () => Promise<GuidelineContent>;
};

export type Guideline = {
    id: string;
    title: string;
    intro?: string;
    Content: React.ComponentType;
};

const cache = new Map<string, () => Guideline[]>();

const guidelinesList: GuidelineInternal[] = [
    {
        id: 'context-specificity',
        en: () => import('./context-specificity.en.mdx'),
        de: () => import('./context-specificity.de.mdx'),
    },
    {
        id: 'positionalities',
        en: () => import('./positionalities.en.mdx'),
        de: () => import('./positionalities.de.mdx'),
    },
    {
        id: 'genre',
        en: () => import('./genre.en.mdx'),
        de: () => import('./genre.de.mdx'),
    },
    {
        id: 'tone-and-attitude',
        en: () => import('./tone-and-attitude.en.mdx'),
        de: () => import('./tone-and-attitude.de.mdx'),
    },
    {
        id: 'maintaining-the-original-language',
        en: () => import('./maintaining-the-original-language.en.mdx'),
        de: () => import('./maintaining-the-original-language.de.mdx'),
    },
    {
        id: 'typographic-options',
        en: () => import('./typographic-options.en.mdx'),
        de: () => import('./typographic-options.de.mdx'),
    },
    {
        id: 'harmful-language',
        en: () => import('./harmful-language.en.mdx'),
        de: () => import('./harmful-language.de.mdx'),
    },
    {
        id: 'creative-solutions',
        en: () => import('./creative-solutions.en.mdx'),
        de: () => import('./creative-solutions.de.mdx'),
    },
];

export const guidelineKeys = guidelinesList.map(guideline => guideline.id);

const wrapWithBaseProvider = (Component: React.ComponentType) => () =>
    React.createElement(MdxLinkBaseProvider, { base: MANIFESTO }, React.createElement(Component));

const getInitialReader = <T>(initialPromise: Promise<T>) => {
    let initialData: T;
    let initialError: any;
    let promise = initialPromise.then(
        data => (initialData = data),
        error => (initialError = error)
    );
    return () => {
        if (initialError) {
            throw initialError;
        }
        if (!initialData) {
            throw promise;
        }
        return initialData;
    };
};

const getReader = (lang: Lang, guidelines: GuidelineInternal[]) => {
    const key = [lang, ...guidelines.map(({ id }) => id)].join();
    const cachedReader = cache.get(key);

    if (cachedReader) {
        return cachedReader;
    }

    const promise = Promise.all(
        guidelines.map(guideline =>
            guideline[lang]().then(
                (content): Guideline => ({
                    id: guideline.id,
                    title: content.title,
                    intro: content.intro,
                    Content: wrapWithBaseProvider(content.default),
                })
            )
        )
    );
    const reader = getInitialReader(promise);
    cache.set(key, reader);
    return reader;
};

export const useGuidelines = (keys?: string[]) => {
    const [lang] = useLang();
    return getReader(lang, keys ? guidelinesList.filter(guideline => keys.includes(guideline.id)) : guidelinesList);
};
