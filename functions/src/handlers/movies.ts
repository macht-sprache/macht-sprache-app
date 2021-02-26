import { logger } from 'firebase-functions';
import fetch from 'node-fetch';
import { isValid } from 'rambdax';
import { langA, langB } from '../../../src/languages';
import { Lang, Movie } from '../../../src/types';

if (!process.env.TMDB_API_KEY) {
    throw new Error('Env TMDB_API_KEY is not defined.');
}

const apiKey = process.env.TMDB_API_KEY;
const baseUrl = 'https://api.themoviedb.org/3';
const baseUrlImages = 'https://image.tmdb.org/t/p/w500';
const serviceName = 'tmdb';

const toSourceId = (tmdbId: number, lang: Lang) => [serviceName, lang, tmdbId].join(':');
const toTmdbId = (sourceId: string) => {
    const [idServiceName, idLanguage, tmdbId] = sourceId.split(':');
    const lang = ([langA, langB] as const).find(lang => lang === idLanguage);

    if (!idServiceName || !lang || !tmdbId) {
        throw new Error('Invalid source id ' + sourceId);
    }

    return { tmdbId, lang };
};

const MovieSchema = {
    id: String,
    lang: String,
    title: String,
    'directors?': [String],
    year: Number,
    'coverUrl?': String,
};

const isValidMovie = (movie: object): movie is Movie => isValid({ input: movie, schema: MovieSchema });

const fetchTmdbApi = async (path: string, queryParams: Record<string, string>) => {
    const url = new URL(baseUrl + path);
    url.search = new URLSearchParams(queryParams).toString();
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Response not ok.');
    }

    return await response.json();
};

const toMovie = (lang: Lang) => (tmdbMovie: any): Partial<Movie> => {
    return {
        id: toSourceId(tmdbMovie.id, lang),
        lang,
        title: tmdbMovie.title,
        year: parseInt(tmdbMovie.release_date?.match(/^\d+/)?.[0]),
        coverUrl: typeof tmdbMovie.poster_path === 'string' ? baseUrlImages + tmdbMovie.poster_path : undefined,
    };
};

export const searchMovies = async (query: string, lang: Lang) => {
    const { results } = await fetchTmdbApi('/search/movie', {
        api_key: apiKey,
        query,
        language: lang,
    });

    if (!Array.isArray(results)) {
        throw new Error('Invalid tmdb response.');
    }

    return results.map(toMovie(lang)).filter(isValidMovie);
};

export const getMovie = async (sourceId: string) => {
    const { tmdbId, lang } = toTmdbId(sourceId);
    const details = await fetchTmdbApi(`/movie/${tmdbId}`, {
        api_key: apiKey,
        language: lang,
    });
    const { crew }: { crew: any[] } = await fetchTmdbApi(`/movie/${tmdbId}/credits`, {
        api_key: apiKey,
        language: lang,
    });

    const directors: string[] = crew
        .filter((member: any) => member.job === 'Director')
        .map((member: any) => member.name);
    const movie: Partial<Movie> = { ...toMovie(lang)(details), directors };

    if (!isValidMovie(movie)) {
        logger.error('Invalid movie', { movie });
        throw new Error("Couldn't get movie.");
    }

    return movie;
};
