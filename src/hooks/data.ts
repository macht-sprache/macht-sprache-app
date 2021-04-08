import firebase from 'firebase/app';
import { useMemo } from 'react';
import { db } from '../firebase';
import { langA, langB } from '../languages';
import {
    Comment,
    DocReference,
    GlobalSettings,
    Lang,
    Rating,
    SensitiveTerms,
    Source,
    SourceType,
    Term,
    Translation,
    TranslationExample,
    User,
    UserProperties,
    UserSettings,
} from '../types';

const defaultSnapshotOptions: firebase.firestore.SnapshotOptions = { serverTimestamps: 'estimate' };

const getCreatedAt = (entity: { id?: string; createdAt: firebase.firestore.Timestamp }) =>
    entity.id ? entity.createdAt : firebase.firestore.FieldValue.serverTimestamp();

const UserConverter: firebase.firestore.FirestoreDataConverter<User> = {
    toFirestore: (user: User) => {
        const { id, ...data } = user;
        return data;
    },
    fromFirestore: (snapshot): User => {
        const { displayName, displayNameLowerCase, externalProfiles, bio } = snapshot.data(defaultSnapshotOptions);
        return { id: snapshot.id, displayName, displayNameLowerCase, externalProfiles, bio };
    },
};

const UserSettingsConverter: firebase.firestore.FirestoreDataConverter<UserSettings> = {
    toFirestore: (data: UserSettings) => data,
    fromFirestore: (snapshot): UserSettings => {
        const { lang, showRedacted, newsletter } = snapshot.data(defaultSnapshotOptions);
        return { lang, showRedacted, newsletter };
    },
};

const UserPropertiesConverter: firebase.firestore.FirestoreDataConverter<UserProperties> = {
    toFirestore: (data: UserProperties) => data,
    fromFirestore: (snapshot): UserProperties => {
        const { admin, enabled, tokenTime } = snapshot.data(defaultSnapshotOptions);
        return { admin, enabled: enabled ?? false, tokenTime: tokenTime ?? new Date(0).toISOString() };
    },
};

const TermConverter: firebase.firestore.FirestoreDataConverter<Term> = {
    toFirestore: (term: Term) => {
        const { id, ...data } = term;
        return { ...data, createdAt: getCreatedAt(term) };
    },
    fromFirestore: (snapshot): Term => {
        const {
            relatedTerms,
            creator,
            createdAt,
            value,
            variants,
            lang,
            commentCount,
            adminComment,
            adminTags,
        } = snapshot.data(defaultSnapshotOptions);
        return {
            id: snapshot.id,
            relatedTerms,
            creator,
            createdAt,
            value,
            variants,
            lang,
            commentCount,
            adminComment,
            adminTags,
        };
    },
};

const TranslationConverter: firebase.firestore.FirestoreDataConverter<Translation> = {
    toFirestore: (translation: Translation) => {
        const { id, ...data } = translation;
        return { ...data, createdAt: getCreatedAt(translation) };
    },
    fromFirestore: (snapshot): Translation => {
        const { term, creator, createdAt, value, variants, lang, ratings, commentCount } = snapshot.data(
            defaultSnapshotOptions
        );
        return { id: snapshot.id, term, creator, createdAt, value, variants, lang, ratings, commentCount };
    },
};

const TranslationExampleConverter: firebase.firestore.FirestoreDataConverter<TranslationExample> = {
    toFirestore: (translationExample: TranslationExample) => {
        const { id, ...data } = translationExample;
        return data;
    },
    fromFirestore: (snapshot): TranslationExample => {
        const { translation, creator, createdAt, type, original, translated, commentCount } = snapshot.data(
            defaultSnapshotOptions
        );
        return { id: snapshot.id, translation, creator, type, createdAt, original, translated, commentCount };
    },
};

const SourceConverter: firebase.firestore.FirestoreDataConverter<Source> = {
    toFirestore: (source: Source) => {
        const { id, ...data } = source;
        return data;
    },
    fromFirestore: (snapshot): Source => {
        const { id } = snapshot;
        const data = snapshot.data(defaultSnapshotOptions);
        const {
            title,
            terms,
            translations,
            lang,
            authors,
            author,
            directors,
            year,
            isbn,
            coverUrl,
            url,
            description,
            date,
            logoUrl,
            imageUrl,
            refs,
        } = data;
        const type: SourceType = data.type;
        const base = { id, lang, title, terms, translations, refs };
        switch (type) {
            case 'BOOK':
                return { ...base, type, coverUrl, authors, year, isbn };
            case 'MOVIE':
                return { ...base, type, coverUrl, directors, year };
            case 'WEBPAGE':
                return { ...base, type, author, url, description, date, logoUrl, imageUrl };
        }
    },
};

const RatingConverter: firebase.firestore.FirestoreDataConverter<Rating> = {
    toFirestore: (rating: Pick<Rating, 'rating'>) => ({
        rating: rating.rating,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }),
    fromFirestore: (snapshot): Rating => {
        const { rating, updatedAt } = snapshot.data(defaultSnapshotOptions);
        return { rating, updatedAt };
    },
};

const SensitiveTermsConverter: firebase.firestore.FirestoreDataConverter<SensitiveTerms> = {
    toFirestore: (sensitiveTerms: SensitiveTerms) => sensitiveTerms,
    fromFirestore: (snapshot): SensitiveTerms => {
        const { terms } = snapshot.data(defaultSnapshotOptions);
        return { terms };
    },
};

const CommentConverter: firebase.firestore.FirestoreDataConverter<Comment> = {
    toFirestore: (comment: Comment) => {
        const { id, ...data } = comment;
        return { ...data, createdAt: getCreatedAt(comment) };
    },
    fromFirestore: (snapshot): Comment => {
        const { creator, ref, createdAt, comment, edited } = snapshot.data(defaultSnapshotOptions);
        return { id: snapshot.id, creator, ref, createdAt, comment, edited: edited ?? null };
    },
};

const GlobalSettingsConverter: firebase.firestore.FirestoreDataConverter<GlobalSettings> = {
    toFirestore: (globalSettings: GlobalSettings) => globalSettings,
    fromFirestore: (snapshot): GlobalSettings => {
        const { enableNewUsers } = snapshot.data(defaultSnapshotOptions);
        return { enableNewUsers };
    },
};

export const collections = {
    users: db.collection('users').withConverter(UserConverter),
    userSettings: db.collection('userSettings').withConverter(UserSettingsConverter),
    userProperties: db.collection('userProperties').withConverter(UserPropertiesConverter),
    terms: db.collection('terms').withConverter(TermConverter),
    translations: db.collection('translations').withConverter(TranslationConverter),
    translationExamples: db.collection('translationExamples').withConverter(TranslationExampleConverter),
    sources: db.collection('sources').withConverter(SourceConverter),
    sensitiveTerms: db.collection('sensitiveTerms').withConverter(SensitiveTermsConverter),
    comments: db.collection('comments').withConverter(CommentConverter),
    settings: db.collection('settings').withConverter(GlobalSettingsConverter),
};

export const getTranslationsRef = (termRef: firebase.firestore.DocumentReference<Term>) =>
    collections.translations.where('term', '==', termRef);

export const getTranslationExamplesRef = (translationRef: firebase.firestore.DocumentReference<Translation>) =>
    collections.translationExamples.where('translation', '==', translationRef);

export const getSourcesRef = (ref: DocReference<Term | Translation>) =>
    collections.sources.where('refs', 'array-contains', ref);

export const getRatingRef = (userId: string, translationId: string) =>
    collections.translations.doc(translationId).collection('ratings').withConverter(RatingConverter).doc(userId);

export const getCommentsRef = (ref: Comment['ref']) =>
    collections.comments.where('ref', '==', ref).orderBy('createdAt');

export async function addTerm(user: User, value: string, lang: Lang, comment?: string) {
    const termRef = collections.terms.doc();
    await termRef.set({
        id: '',
        relatedTerms: [],
        variants: [],
        lang,
        value,
        commentCount: 0,
        adminTags: {
            hideFromList: false,
            showInSidebar: false,
            hightlightLandingPage: false,
            disableExamples: false,
            enableCommentsOnTranslations: false,
        },
        adminComment: '',
        creator: { id: user.id, displayName: user.displayName },
        createdAt: firebase.firestore.Timestamp.now(),
    });

    if (comment) {
        await addComment(user, termRef, comment);
    }

    return termRef;
}

export async function addTranslation(user: User, term: Term, value: string, comment?: string) {
    const translationRef = collections.translations.doc();
    await translationRef.set({
        id: '',
        variants: [],
        term: collections.terms.doc(term.id),
        lang: term.lang === langA ? langB : langA,
        value,
        commentCount: 0,
        creator: { id: user.id, displayName: user.displayName },
        createdAt: firebase.firestore.Timestamp.now(),
        ratings: null,
    });

    if (comment) {
        await addComment(user, translationRef, comment);
    }

    return translationRef;
}

export function useGroupedSources(sources: Source[]) {
    return useMemo(
        () =>
            sources.reduce<{ [refId: string]: Source[] }>((acc, cur) => {
                cur.refs.forEach(({ id }) => {
                    if (acc[id]) {
                        if (!acc[id].includes(cur)) {
                            acc[id].push(cur);
                        }
                    } else {
                        acc[id] = [cur];
                    }
                });
                return acc;
            }, {}),
        [sources]
    );
}

export const setRating = (userId: string, translationId: string, rating: number) =>
    collections.translations
        .doc(translationId)
        .collection('ratings')
        .withConverter(RatingConverter)
        .doc(userId)
        .set({ rating, updatedAt: firebase.firestore.Timestamp.now() });

export const addComment = (user: User, ref: Comment['ref'], comment: string) => {
    return collections.comments.doc().set({
        id: '',
        ref,
        creator: {
            id: user.id,
            displayName: user.displayName,
        },
        edited: null,
        createdAt: firebase.firestore.Timestamp.now(),
        comment,
    });
};

export const updateComment = (user: User, id: string, comment: string) => {
    return collections.comments.doc(id).update({
        comment,
        edited: {
            by: {
                id: user.id,
                displayName: user.displayName,
            },
            at: firebase.firestore.FieldValue.serverTimestamp(),
        },
    });
};

export const deleteComment = (id: string) => collections.comments.doc(id).delete();
