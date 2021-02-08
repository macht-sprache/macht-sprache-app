import firebase from 'firebase/app';
import { Term, Translation, User, Comment } from './types';

const defaultSnapshotOptions: firebase.firestore.SnapshotOptions = { serverTimestamps: 'estimate' };
const getCreatedAt = (entity: { id?: string; createdAt: firebase.firestore.Timestamp }) =>
    entity.id ? entity.createdAt : firebase.firestore.FieldValue.serverTimestamp();

export const UserConverter: firebase.firestore.FirestoreDataConverter<User> = {
    toFirestore: (user: User) => {
        const { id, ...data } = user;
        return data;
    },
    fromFirestore: (snapshot): User => {
        const { displayName, lang } = snapshot.data(defaultSnapshotOptions);
        return { id: snapshot.id, displayName, lang };
    },
};

export const TermConverter: firebase.firestore.FirestoreDataConverter<Term> = {
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

export const TranslationConverter: firebase.firestore.FirestoreDataConverter<Translation> = {
    toFirestore: (translation: Translation) => {
        const { id, ...data } = translation;
        return { ...data, createdAt: getCreatedAt(translation) };
    },
    fromFirestore: (snapshot): Translation => {
        const { term, creator, createdAt, value, variants, lang, commentCount } = snapshot.data(defaultSnapshotOptions);
        return { id: snapshot.id, term, creator, createdAt, value, variants, lang, commentCount };
    },
};

export const CommentConverter: firebase.firestore.FirestoreDataConverter<Comment> = {
    toFirestore: (comment: Comment) => {
        const { id, ...data } = comment;
        return { ...data, createdAt: getCreatedAt(comment) };
    },
    fromFirestore: (snapshot): Comment => {
        const { creator, ref, createdAt, comment } = snapshot.data(defaultSnapshotOptions);
        return { id: snapshot.id, creator, ref, createdAt, comment };
    },
};
