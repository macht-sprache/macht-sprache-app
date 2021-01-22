import type firebase from 'firebase';

type DocReference<T> = firebase.firestore.DocumentReference<T>;
type Timestamp = firebase.firestore.Timestamp;

export interface Term {
    id: string;
    relatedTerms: DocReference<Term>[];
    creatorId: string;
    createdAt: Timestamp;

    value: string;
    variants: string[];
    lang: string;
}

export interface Translation {
    id: string;
    term: DocReference<Term>;
    creatorId: string;
    createdAt: Timestamp;

    value: string;
    variants: string[];
    lang: string;
}

export interface TranslationExample {
    id: string;
    translations: DocReference<Translation>[];
    creatorId: string;
    createdAt: Timestamp;

    authors: string[];
    originalSnippet: Snippet;
    translated: Snippet;
}

type Snippet = BookSnippet | LinkSnippet;

interface BaseSnippet {
    title: string;
    text: string;
}

interface BookSnippet extends BaseSnippet {
    type: 'BOOK';
    isbn: string;
}

interface LinkSnippet extends BaseSnippet {
    type: 'LINK';
    link: string;
}

export interface Comment {
    creatorId: string;
    ref: DocReference<Term | Translation | TranslationExample>;
    createdId: Timestamp;

    comment: string;
}
