import { useCallback, useMemo } from 'react';
import { langA, langB } from '../languages';
import { useLang } from '../useLang';

const WP_BASE_URL = 'https://pocolit.com/wp-json/wp/v2/';
const TTL = 10 * 60 * 1000;
const cache = new Map<string, { date: number; reader: () => any }>();

type WpResponsePost = {
    title: { rendered: string };
    content: { rendered: string };
    excerpt: { rendered: string };
    date: string;
    link: string;
    _embedded?: any;
};

export type WpMedia = { width: number; height: number; sizes: [{ width: number; height: number; source_url: string }] };

export type WpPost = {
    title: string;
    body: string;
    date: Date;
    excerpt: string;
    link: string;
    featuredMedia?: WpMedia;
};

const getFetchPromise = (url: string) =>
    window.fetch(url).then(response => {
        if (response.ok) {
            return response.json();
        }
        return Promise.reject(response.statusText);
    });

const getInitialReader = <T>(url: string) => {
    let initialData: T;
    let initialError: any;
    let promise = getFetchPromise(url).then(
        data => (initialData = data),
        error => (initialError = error)
    );
    return () => {
        if (initialError) {
            cache.delete(url);
            throw initialError;
        }
        if (!initialData) {
            throw promise;
        }
        return initialData;
    };
};

function useFetchUrl<T>(url: string): () => T {
    return useMemo(() => {
        const cached = cache.get(url);
        if (cached && cached.date > Date.now() - TTL) {
            return cached.reader;
        } else {
            const reader = getInitialReader<T>(url);
            cache.set(url, { date: Date.now(), reader });
            return reader;
        }
    }, [url]);
}

export function useWpPosts(tags: { [langA]: string; [langB]: string }, limit = 10) {
    const [lang] = useLang();
    const url = `${WP_BASE_URL}posts?lang=${lang}&tags=${tags[lang]}&_embed&per_page=${limit}`;
    const reader = useFetchUrl<WpResponsePost[]>(url);
    return useCallback(() => {
        const response: WpResponsePost[] = reader();
        return response.map(transformWpPost);
    }, [reader]);
}

export function useWpPage(slugs: { [langA]: string; [langB]: string }) {
    const [lang] = useLang();
    const url = `${WP_BASE_URL}pages?lang=${lang}&slug=${slugs[lang]}`;
    const reader = useFetchUrl<WpResponsePost[]>(url);
    return useCallback(() => {
        const response: WpResponsePost[] = reader();
        return transformWpPost(response[0]);
    }, [reader]);
}

function transformWpPost(post: WpResponsePost): WpPost {
    const featuredMedia = post?._embedded?.['wp:featuredmedia']?.[0]?.media_details;

    if (featuredMedia) {
        featuredMedia.sizes = Object.values(featuredMedia.sizes);
    }

    return {
        title: post.title.rendered,
        body: post.content.rendered,
        date: new Date(post.date),
        link: post.link,
        excerpt: post.excerpt.rendered,
        featuredMedia: featuredMedia,
    };
}
