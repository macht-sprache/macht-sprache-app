import type firebase from 'firebase';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { db } from './firebase';
import { Comment, Term, Translation, TranslationExample, User } from './types';

const defaultOptions = { idField: 'id' };

const UserConverter: firebase.firestore.FirestoreDataConverter<User> = {
    toFirestore: (user: User) => {
        const { id, ...data } = user;
        return data;
    },
    fromFirestore: (snapshot, options): User => {
        const { displayName, lang } = snapshot.data(options);
        return { id: snapshot.id, displayName, lang };
    },
};

const TermConverter: firebase.firestore.FirestoreDataConverter<Term> = {
    toFirestore: (term: Term) => {
        const { id, ...data } = term;
        return data;
    },
    fromFirestore: (snapshot, options): Term => {
        const { relatedTerms, creatorId, createdAt, value, variants, lang, commentCount } = snapshot.data(options);
        return { id: snapshot.id, relatedTerms, creatorId, createdAt, value, variants, lang, commentCount };
    },
};

const TranslationConverter: firebase.firestore.FirestoreDataConverter<Translation> = {
    toFirestore: (term: Translation) => {
        const { id, ...data } = term;
        return data;
    },
    fromFirestore: (snapshot, options): Translation => {
        const { term, creatorId, createdAt, value, variants, lang, commentCount } = snapshot.data(options);
        return { id: snapshot.id, term, creatorId, createdAt, value, variants, lang, commentCount };
    },
};

export const collections = {
    users: db.collection('users').withConverter(UserConverter),
    terms: db.collection('terms').withConverter(TermConverter),
    translations: db.collection('translations').withConverter(TranslationConverter),
    translationExamples: db.collection('translationExamples'),
    comments: db.collection('comments'),
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
    return useCollectionData<Comment>(collections.comments.where('ref', '==', ref), defaultOptions);
}
