import firebase from 'firebase/app';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { db } from './firebase';
import { Comment, Term, Translation, TranslationExample, User } from './types';

const defaultOptions = { idField: 'id' };
const defaultSnapshotOptions: firebase.firestore.SnapshotOptions = { serverTimestamps: 'estimate' };

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
        return data;
    },
    fromFirestore: (snapshot): Term => {
        const { relatedTerms, creatorId, createdAt, value, variants, lang, commentCount } = snapshot.data(
            defaultSnapshotOptions
        );
        return { id: snapshot.id, relatedTerms, creatorId, createdAt, value, variants, lang, commentCount };
    },
};

const TranslationConverter: firebase.firestore.FirestoreDataConverter<Translation> = {
    toFirestore: (term: Translation) => {
        const { id, ...data } = term;
        return data;
    },
    fromFirestore: (snapshot): Translation => {
        const { term, creatorId, createdAt, value, variants, lang, commentCount } = snapshot.data(
            defaultSnapshotOptions
        );
        return { id: snapshot.id, term, creatorId, createdAt, value, variants, lang, commentCount };
    },
};

const CommentConverter: firebase.firestore.FirestoreDataConverter<Comment> = {
    toFirestore: (comment: Comment) => {
        const { id, ...data } = comment;
        return { ...data, createdAt: id ? data.createdAt : firebase.firestore.FieldValue.serverTimestamp() };
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
    translationExamples: db.collection('translationExamples'),
    comments: db.collection('comments').withConverter(CommentConverter),
};

export function useTerms() {
    return useCollectionData<Term>(collections.terms);
}

export function useTerm(id: string) {
    return useDocumentData<Term>(collections.terms.doc(id));
}

export function useTranslations(termId: string) {
    return useCollectionData<Translation>(
        collections.translations.where('term', '==', collections.terms.doc(termId)),
        defaultOptions
    );
}

export function useTranslationExamples(translationId: string) {
    return useCollectionData<TranslationExample>(
        collections.translationExamples.where(
            'translations',
            'array-contains',
            collections.translations.doc(translationId)
        ),
        defaultOptions
    );
}

export function useComments(ref: Comment['ref']) {
    return useCollectionData<Comment>(collections.comments.where('ref', '==', ref).orderBy('createdAt'));
}

export const addComment = (ref: Comment['ref'], comment: string, user: User) => {
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
