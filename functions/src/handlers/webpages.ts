import type metascraper from 'metascraper';
import fetch from 'node-fetch';
import { langA, langB } from '../../../src/languages';
import { Lang, WebPage } from '../../../src/types';
import { extractRootDomain } from '../../../src/utils';
import { HttpsError } from '../firebase';

const scraper = (require('metascraper') as typeof metascraper)([
    require('metascraper-author')(),
    require('metascraper-date')(),
    require('metascraper-description')(),
    require('metascraper-image')(),
    require('metascraper-lang')(),
    require('metascraper-logo')(),
    require('metascraper-logo-favicon')(),
    require('metascraper-publisher')(),
    require('metascraper-title')(),
    require('metascraper-url')(),
]);

const serviceName = 'webpage';
const toSourceId = (url: string, lang: Lang) => [serviceName, lang, encodeURIComponent(url)].join(':');
const fromSourceId = (sourceId: string) => {
    const [idServiceName, idLanguage, encodedUrl] = sourceId.split(':');
    const lang = ([langA, langB] as const).find(lang => lang === idLanguage);
    const url = decodeURIComponent(encodedUrl);

    if (idServiceName !== serviceName || !lang || !url) {
        throw new Error('Invalid source id ' + sourceId);
    }

    return { url, lang };
};

const fetchPage = async (url: string) => {
    const response = await fetch(url, { headers: { 'user-agent': 'MachtSprache/Bot Googlebot' } });

    if (!response.ok) {
        if (response.status === 404) {
            throw new HttpsError('not-found', 'Page not found');
        }
        throw new HttpsError('unavailable', 'Fetching page failed');
    }

    const html = await response.text();
    return { html, url: response.url };
};

export const searchWebPage = async (url: string, lang: Lang): Promise<WebPage> => {
    const meta = await scraper(await fetchPage(url));
    // @ts-ignore
    const logoUrl: string | undefined = meta.logo || undefined;
    return {
        id: toSourceId(url, lang),
        lang,
        title: meta.title || extractRootDomain(meta.url),
        description: meta.description || undefined,
        author: meta.author || undefined,
        publisher: meta.publisher || undefined,
        date: meta.date || undefined,
        logoUrl,
        imageUrl: meta.image || undefined,
        url: meta.url,
    };
};

export const getWebPage = async (sourceId: string) => {
    const { url, lang } = fromSourceId(sourceId);
    return searchWebPage(url, lang);
};
