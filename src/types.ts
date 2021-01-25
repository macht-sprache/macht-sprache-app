import type firebase from 'firebase';

type DocReference<T> = firebase.firestore.DocumentReference<T>;
type Timestamp = firebase.firestore.Timestamp;

interface Commentable {
    commentCount: number;
}

export interface Term extends Commentable {
    id: string;
    relatedTerms: DocReference<Term>[];
    creatorId: string;
    createdAt: Timestamp;

    value: string;
    variants: string[];
    lang: string;
}

export interface Translation extends Commentable {
    id: string;
    term: DocReference<Term>;
    creatorId: string;
    createdAt: Timestamp;

    value: string;
    variants: string[];
    lang: string;
}

export interface TranslationExample extends Commentable {
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
    createdAt: Timestamp;

    comment: string;
}
