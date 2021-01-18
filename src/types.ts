import type firebase from 'firebase';
export interface Term {
    id: string;
    relatedTermIds: string[];
    creatorId: string;

    value: string;
    variants: string[];
    lang: string;
}

export interface Translation {
    id: string;
    termId: string;
    creatorId: string;

    value: string;
    variants: string[];
    lang: string;
}

export interface TranslationExample {
    id: string;
    translationId: string;
    creatorId: string;

    author: string;
    translator: string;
    original: Snippet;
    translation: Snippet;
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
    ref: firebase.firestore.DocumentReference<Term | Translation | TranslationExample>;
}
