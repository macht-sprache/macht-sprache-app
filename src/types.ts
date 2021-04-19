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

export interface Editable {
    edited: {
        at: Timestamp;
        by: UserMini;
    } | null;
}

export interface Term extends Commentable {
    id: string;
    relatedTerms: DocReference<Term>[];
    creator: UserMini;
    createdAt: Timestamp;
    adminTags: {
        hightlightLandingPage: boolean;
        showInSidebar: boolean;
        hideFromList: boolean;
        disableExamples: boolean;
        enableCommentsOnTranslations: boolean;
        translationsAsVariants: boolean;
    };
    adminComment: { langA: string; langB: string };

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
    ratings: number[] | null;
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

export interface MovieSnippet extends BaseSnippet {
    source: DocReference<MovieSource>;
}

export interface WebPageSnippet extends BaseSnippet {
    source: DocReference<WebPageSource>;
}

export interface BaseSource<T extends SourceType> {
    id: string;
    type: T;
    title: string;
    refs: DocReference<Term | Translation>[];
}

export type BookSource = SourceForType<'BOOK'>;
export type MovieSource = SourceForType<'MOVIE'>;
export type WebPageSource = SourceForType<'WEBPAGE'>;

export type Source = BookSource | MovieSource | WebPageSource;

export type SourceForType<T extends SourceType> = SourceMediaForType<T> & BaseSource<T>;
export type SourceMediaForType<T extends SourceType> = T extends 'BOOK'
    ? Book
    : T extends 'MOVIE'
    ? Movie
    : T extends 'WEBPAGE'
    ? WebPage
    : never;

export interface Book {
    id: string;
    lang: Lang;
    title: string;
    authors: string[];
    publisher?: string;
    year: number;
    isbn: string;
    coverUrl?: string;
}

export interface Movie {
    id: string;
    lang: Lang;
    title: string;
    directors?: string[];
    year: number;
    coverUrl?: string;
}

export interface WebPage {
    id: string;
    lang: Lang;
    title: string;
    description?: string;
    author?: string;
    publisher?: string;
    date?: string;
    logoUrl?: string;
    imageUrl?: string;
    url: string;
}

export interface Rating {
    rating: number;
    updatedAt: Timestamp;
}

export interface Comment extends Editable {
    id: string;
    creator: UserMini;
    ref: DocReference<Term | Translation | TranslationExample>;
    createdAt: Timestamp;

    comment: string;
    likeCount: number;
}

export interface Like {
    creator: UserMini;
    createdAt: Timestamp;
}

export interface UserMini {
    id: string;
    displayName: string;
}

export interface User extends UserMini {
    displayNameLowerCase: string;
    bio?: string;
    externalProfiles?: {
        twitter?: string;
        website?: string;
        instagram?: string;
    };
}

export interface UserSettings {
    lang: Lang;
    showRedacted: boolean;
    newsletter: boolean;
}

export interface UserProperties {
    admin: boolean;
    enabled: boolean;
    tokenTime: string;
}

export interface SensitiveTerms {
    terms: string[];
}

export interface GlobalSettings {
    enableNewUsers: boolean;
}

export interface BaseNotification {
    actor: UserMini;
    createdAt: Timestamp;

    seenAt: Timestamp | null;
    readAt: Timestamp | null;

    entityRef: DocReference<Comment | Translation | TranslationExample>;
    parentRef: DocReference<Term | Translation | TranslationExample>;
    parentName: string;
}

export interface CommentAddedNotification extends BaseNotification {
    type: 'CommentAddedNotification';
    entityRef: DocReference<Comment>;
}
export interface CommentLikedNotification extends BaseNotification {
    type: 'CommentLikedNotification';
    entityRef: DocReference<Comment>;
}

export interface TranslationAddedNotification extends BaseNotification {
    type: 'TranslationAddedNotification';
    entityRef: DocReference<Translation>;
    parentRef: DocReference<Term>;
}

export interface TranslationExampleAddedNotification extends BaseNotification {
    type: 'TranslationExampleAddedNotification';
    entityRef: DocReference<TranslationExample>;
    parentRef: DocReference<Translation>;
}

export type Notification =
    | CommentAddedNotification
    | CommentLikedNotification
    | TranslationAddedNotification
    | TranslationExampleAddedNotification;

export interface Subscription {
    creator: UserMini;
    createdAt: Timestamp;
    updatedAt: Timestamp | null;
    active: boolean;
}
