import type firebase from 'firebase';
import { langA, langB } from './languages';

export type LangA = typeof langA;
export type LangB = typeof langB;
export type Lang = LangA | LangB;

export type DocReference<T> = firebase.firestore.DocumentReference<T>;
type Timestamp = firebase.firestore.Timestamp;

interface Commentable {
    commentCount: number;
}

export interface Term extends Commentable {
    id: string;
    relatedTerms: DocReference<Term>[];
    creator: UserMini;
    createdAt: Timestamp;

    value: string;
    variants: string[];
    lang: Lang;
}

export interface Translation extends Commentable {
    id: string;
    term: DocReference<Term>;
    creator: UserMini;
    createdAt: Timestamp;

    value: string;
    variants: string[];
    lang: Lang;
    ratings?: number[];
}

export type SourceType = 'BOOK' | 'WEBPAGE' | 'MOVIE';

interface BaseTranslationExample<T extends SourceType, U extends BaseSnippet> extends Commentable {
    id: string;
    translation: DocReference<Translation>;
    creator: UserMini;
    createdAt: Timestamp;
    type: T;
    original: U;
    translated: U;
}

export type BookTranslationExample = BaseTranslationExample<'BOOK', BookSnippet>;

export type MovieTranslationExample = BaseTranslationExample<'MOVIE', MovieSnippet>;

export type WebPageTranslationExample = BaseTranslationExample<'WEBPAGE', WebPageSnippet>;

export type TranslationExample = BookTranslationExample | MovieTranslationExample | WebPageTranslationExample;

export interface BaseSnippet {
    text: string;
    matches: string[];
}

export interface BookSnippet extends BaseSnippet {
    source: DocReference<BookSource>;
    pageNumber?: string;
}

interface MovieSnippet extends BaseSnippet {
    source: DocReference<MovieSource>;
}

interface WebPageSnippet extends BaseSnippet {
    source: DocReference<WebPageSource>;
}

interface BaseSource<T extends SourceType> {
    id: string;
    type: T;
    title: string;
    refs: DocReference<Term | Translation>[];
}

export interface BookSource extends BaseSource<'BOOK'>, Book {}
export interface MovieSource extends BaseSource<'MOVIE'>, Movie {}
export interface WebPageSource extends BaseSource<'WEBPAGE'>, WebPage {}

export type Source = BookSource | MovieSource | WebPageSource;
export interface Book {
    id: string;
    title: string;
    authors: string[];
    publisher?: string;
    year: number;
    isbn: string;
    coverUrl?: string;
}

export interface Movie {
    id: string;
    title: string;
    directors: string[];
    studio?: string;
    year: number;
    coverUrl?: string;
}

export interface WebPage {
    title: string;
    authors: string[];
    publisher?: string;
    year?: number;
    logo?: string;
    image?: string;
    url: string;
}

export interface Rating {
    rating: number;
    updatedAt: Timestamp;
}

export interface Comment {
    id: string;
    creator: UserMini;
    ref: DocReference<Term | Translation | TranslationExample>;
    createdAt: Timestamp;

    comment: string;
}

interface UserMini {
    id: string;
    displayName: string;
}

export interface User extends UserMini {
    lang: Lang;
}
