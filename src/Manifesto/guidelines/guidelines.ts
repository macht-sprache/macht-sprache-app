/* eslint-disable import/no-webpack-loader-syntax */

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
        en: () => import('!babel-loader!@mdx-js/loader!./context-specificity.en.mdx'),
        de: () => import('!babel-loader!@mdx-js/loader!./context-specificity.de.mdx'),
    },
    {
        id: 'positionalities',
        en: () => import('!babel-loader!@mdx-js/loader!./positionalities.en.mdx'),
        de: () => import('!babel-loader!@mdx-js/loader!./positionalities.de.mdx'),
    },
    {
        id: 'genre',
        en: () => import('!babel-loader!@mdx-js/loader!./genre.en.mdx'),
        de: () => import('!babel-loader!@mdx-js/loader!./genre.de.mdx'),
    },
    {
        id: 'tone-and-attitude',
        en: () => import('!babel-loader!@mdx-js/loader!./tone-and-attitude.en.mdx'),
        de: () => import('!babel-loader!@mdx-js/loader!./tone-and-attitude.de.mdx'),
    },
    {
        id: 'maintaining-the-original-language',
        en: () => import('!babel-loader!@mdx-js/loader!./maintaining-the-original-language.en.mdx'),
        de: () => import('!babel-loader!@mdx-js/loader!./maintaining-the-original-language.de.mdx'),
    },
    {
        id: 'typographic-options',
        en: () => import('!babel-loader!@mdx-js/loader!./typographic-options.en.mdx'),
        de: () => import('!babel-loader!@mdx-js/loader!./typographic-options.de.mdx'),
    },
    {
        id: 'harmful-language',
        en: () => import('!babel-loader!@mdx-js/loader!./harmful-language.en.mdx'),
        de: () => import('!babel-loader!@mdx-js/loader!./harmful-language.de.mdx'),
    },
    {
        id: 'creative-solutions',
        en: () => import('!babel-loader!@mdx-js/loader!./creative-solutions.en.mdx'),
        de: () => import('!babel-loader!@mdx-js/loader!./creative-solutions.de.mdx'),
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
