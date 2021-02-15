import firebase from 'firebase/app';
import { useMemo } from 'react';
import { useFirestoreCollectionData, useFirestoreDocData } from 'reactfire';
import { db } from '../firebase';
import { langA, langB } from '../languages';
import {
    Comment,
    DocReference,
    Lang,
    Rating,
    Source,
    SourceType,
    Term,
    Translation,
    TranslationExample,
    User,
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
        const { displayName, lang } = snapshot.data(defaultSnapshotOptions);
        return { id: snapshot.id, displayName, lang };
    },
};

const TermConverter: firebase.firestore.FirestoreDataConverter<Term> = {
    toFirestore: (term: Term) => {
        const { id, ...data } = term;
        return { ...data, createdAt: getCreatedAt(term) };
    },
    fromFirestore: (snapshot): Term => {
        const { relatedTerms, creator, createdAt, value, variants, lang, commentCount } = snapshot.data(
            defaultSnapshotOptions
        );
        return { id: snapshot.id, relatedTerms, creator, createdAt, value, variants, lang, commentCount };
    },
};

const TranslationConverter: firebase.firestore.FirestoreDataConverter<Translation> = {
    toFirestore: (translation: Translation) => {
        const { id, ...data } = translation;
        return { ...data, createdAt: getCreatedAt(translation) };
    },
    fromFirestore: (snapshot): Translation => {
        const { term, creator, createdAt, value, variants, lang, commentCount } = snapshot.data(defaultSnapshotOptions);
        return { id: snapshot.id, term, creator, createdAt, value, variants, lang, commentCount };
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
        const { title, terms, translations, authors, directors, year, isbn, url, refs } = data;
        const type: SourceType = data.type;
        const base = { id, title, terms, translations, refs };
        switch (type) {
            case 'BOOK':
                return { ...base, type, authors, year, isbn };
            case 'MOVIE':
                return { ...base, type, directors, year };
            case 'WEBPAGE':
                return { ...base, type, authors, url };
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

const CommentConverter: firebase.firestore.FirestoreDataConverter<Comment> = {
    toFirestore: (comment: Comment) => {
        const { id, ...data } = comment;
        return { ...data, createdAt: getCreatedAt(comment) };
    },
    fromFirestore: (snapshot): Comment => {
        const { creator, ref, createdAt, comment } = snapshot.data(defaultSnapshotOptions);
        return { id: snapshot.id, creator, ref, createdAt, comment };
    },
};

export const collections = {
    users: db.collection('users').withConverter(UserConverter),
    terms: db.collection('terms').withConverter(TermConverter),
    translations: db.collection('translations').withConverter(TranslationConverter),
    translationExamples: db.collection('translationExamples').withConverter(TranslationExampleConverter),
    sources: db.collection('sources').withConverter(SourceConverter),
    comments: db.collection('comments').withConverter(CommentConverter),
};

export function useTerms() {
    return useFirestoreCollectionData<Term>(collections.terms, { initialData: [] }).data;
}

export function useTerm(id: string) {
    return useFirestoreDocData<Term>(collections.terms.doc(id)).data;
}

export async function addTerm(user: User, value: string, lang: Lang, comment?: string) {
    const termRef = collections.terms.doc();
    await termRef.set({
        id: '',
        relatedTerms: [],
        variants: [],
        lang,
        value,
        commentCount: 0,
        creator: { id: user.id, displayName: user.displayName },
        createdAt: firebase.firestore.Timestamp.now(),
    });

    if (comment) {
        await addComment(user, termRef, comment);
    }

    return termRef;
}

export function useTranslationEntity(id: string) {
    return useFirestoreDocData<Translation>(collections.translations.doc(id)).data;
}

export function useTranslations(termId: string) {
    return useFirestoreCollectionData<Translation>(
        collections.translations.where('term', '==', collections.terms.doc(termId))
    ).data;
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
    });

    if (comment) {
        await addComment(user, translationRef, comment);
    }

    return translationRef;
}

export function useTranslationExamples(translationId: string) {
    return useFirestoreCollectionData<TranslationExample>(
        collections.translationExamples.where('translation', '==', collections.translations.doc(translationId))
    ).data;
}

export function useSources(ref: DocReference<Term | Translation>) {
    const sources = useFirestoreCollectionData<Source>(collections.sources.where('refs', 'array-contains', ref)).data;
    const grouped = useMemo(() => {
        return sources.reduce<{ [refId: string]: Source[] }>((acc, cur) => {
            cur.refs.forEach(({ id }) => {
                if (acc[id]) {
                    acc[id].push(cur);
                } else {
                    acc[id] = [cur];
                }
            });
            return acc;
        }, {});
    }, [sources]);

    return grouped;
}

export function useRating(userId: string, translationId: string) {
    return useFirestoreDocData<Rating | undefined>(
        collections.translations.doc(translationId).collection('ratings').withConverter(RatingConverter).doc(userId)
    ).data;
}

export const setRating = (userId: string, translationId: string, rating: number) =>
    collections.translations
        .doc(translationId)
        .collection('ratings')
        .withConverter(RatingConverter)
        .doc(userId)
        .set({ rating, updatedAt: firebase.firestore.Timestamp.now() });

export function useComments(ref: Comment['ref']) {
    return useFirestoreCollectionData<Comment>(collections.comments.where('ref', '==', ref).orderBy('createdAt'), {
        initialData: [],
    }).data;
}

export const addComment = (user: User, ref: Comment['ref'], comment: string) => {
    return collections.comments.doc().set({
        id: '',
        ref,
        creator: {
            id: user.id,
            displayName: user.displayName,
        },
        createdAt: firebase.firestore.Timestamp.now(),
        comment,
    });
};

export const useDocument = <T>(ref: firebase.firestore.DocumentReference<T>, initialData?: T) => {
    return useFirestoreDocData<T>(ref, initialData && { initialData }).data;
};
