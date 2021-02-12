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
}

export type TranslationExampleType = 'BOOK' | 'LINK';

interface BaseTranslationExample<T extends TranslationExampleType, U extends BaseSnippet> extends Commentable {
    id: string;
    translation: DocReference<Translation>;
    creator: UserMini;
    createdAt: Timestamp;
    type: T;
    original: U;
    translated: U;
}

type BookTranslationExample = BaseTranslationExample<'BOOK', BookSnippet>;

type LinkTranslationExample = BaseTranslationExample<'LINK', LinkSnippet>;

export type TranslationExample = BookTranslationExample | LinkTranslationExample;
interface BaseSnippet {
    text: string;
    matches: string[];
}

export interface BookSnippet extends BaseSnippet {
    source: DocReference<Book>;
    pageNumber?: string;
}

interface LinkSnippet extends BaseSnippet {
    link: string;
}
export interface Book {
    id: string;
    title: string;
    authors: string[];
    publisher?: string;
    year: number;
    isbn: string;
    coverUrl?: string;
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
