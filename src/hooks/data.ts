import firebase from 'firebase/compat/app';
import { useMemo } from 'react';
import { db } from '../firebase';
import { langA, langB } from '../languages';
import {
    Comment,
    DocReference,
    GlobalSettings,
    Lang,
    Like,
    Notification,
    Rating,
    SensitiveTerms,
    Source,
    SourceType,
    Subscription,
    Term,
    TermIndex,
    TermRelation,
    Translation,
    TranslationExample,
    TranslationIndex,
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
    toFirestore: (userSettings: UserSettings) => {
        const { id, ...data } = userSettings;
        return data;
    },
    fromFirestore: (snapshot): UserSettings => {
        const { lang, showRedacted, newsletter, digestMail, notificationMail } = snapshot.data(defaultSnapshotOptions);
        return { id: snapshot.id, lang, showRedacted, newsletter, digestMail, notificationMail };
    },
};

const UserPropertiesConverter: firebase.firestore.FirestoreDataConverter<UserProperties> = {
    toFirestore: (userProperties: UserProperties) => {
        const { id, ...data } = userProperties;
        return data;
    },
    fromFirestore: (snapshot): UserProperties => {
        const { admin, betaAccess, enabled, tokenTime } = snapshot.data(defaultSnapshotOptions);
        return {
            id: snapshot.id,
            admin,
            betaAccess: betaAccess ?? false,
            enabled: enabled ?? false,
            tokenTime: tokenTime ?? new Date(0).toISOString(),
        };
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
            definition,
            adminTags,
            guidelines,
        } = snapshot.data(defaultSnapshotOptions);
        return {
            id: snapshot.id,
            relatedTerms: (relatedTerms ?? []).map(addConverterToRef),
            creator,
            createdAt,
            value,
            variants,
            lang,
            commentCount,
            adminComment,
            definition,
            adminTags,
            guidelines,
        };
    },
};

const TranslationConverter: firebase.firestore.FirestoreDataConverter<Translation> = {
    toFirestore: (translation: Translation) => {
        const { id, ...data } = translation;
        return { ...data, createdAt: getCreatedAt(translation) };
    },
    fromFirestore: (snapshot): Translation => {
        const { term, creator, createdAt, value, variants, lang, ratings, commentCount, definition } = snapshot.data(
            defaultSnapshotOptions
        );
        return {
            id: snapshot.id,
            term: addConverterToRef(term),
            creator,
            createdAt,
            value,
            variants,
            lang,
            ratings,
            commentCount,
            definition,
        };
    },
};

const TermRelationConverter: firebase.firestore.FirestoreDataConverter<TermRelation> = {
    toFirestore: (termRelation: TermRelation) => {
        const { id, ...data } = termRelation;
        return { ...data, createdAt: getCreatedAt(termRelation) };
    },
    fromFirestore: (snapshot): TermRelation => {
        const { terms, creator, createdAt } = snapshot.data(defaultSnapshotOptions);
        return {
            id: snapshot.id,
            terms: terms.map(addConverterToRef),
            creator,
            createdAt,
        };
    },
};

const TermIndexConverter: firebase.firestore.FirestoreDataConverter<TermIndex> = {
    toFirestore: (termIndex: TermIndex) => {
        const { lemmas, ...rest } = termIndex;
        return { lemmas: JSON.stringify(lemmas), ...rest };
    },
    fromFirestore: (snapshot): TermIndex => {
        const { ref, lang, lemmas } = snapshot.data(defaultSnapshotOptions);
        return { ref: addConverterToRef(ref), lang, lemmas: JSON.parse(lemmas) };
    },
};

const TranslationIndexConverter: firebase.firestore.FirestoreDataConverter<TranslationIndex> = {
    toFirestore: (translationIndex: TranslationIndex) => {
        const { lemmas, ...rest } = translationIndex;
        return { lemmas: JSON.stringify(lemmas), ...rest };
    },
    fromFirestore: (snapshot): TranslationIndex => {
        const { ref, lang, lemmas, termRef } = snapshot.data(defaultSnapshotOptions);
        return {
            ref: addConverterToRef(ref),
            lang,
            lemmas: JSON.parse(lemmas),
            termRef: addConverterToRef(termRef),
        };
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
            publisher,
        } = data;
        const type: SourceType = data.type;
        const base = { id, lang, title: title ?? '', terms, translations, refs };
        switch (type) {
            case 'BOOK':
                return { ...base, type, coverUrl, authors, year, isbn, publisher };
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
        const { creator, ref, createdAt, comment, likeCount, edited } = snapshot.data(defaultSnapshotOptions);
        return { id: snapshot.id, creator, ref, createdAt, comment, likeCount, edited: edited ?? null };
    },
};

const LikeConverter: firebase.firestore.FirestoreDataConverter<Like> = {
    toFirestore: (like: Like) => {
        return { ...like, createdAt: getCreatedAt(like) };
    },
    fromFirestore: (snapshot): Like => {
        const { creator, createdAt } = snapshot.data(defaultSnapshotOptions);
        return { creator, createdAt };
    },
};

const SubscriptionConverter: firebase.firestore.FirestoreDataConverter<Subscription> = {
    toFirestore: (subscription: Subscription) => {
        return subscription;
    },
    fromFirestore: (snapshot): Subscription => {
        const { creator, createdAt, updatedAt, active } = snapshot.data(defaultSnapshotOptions);
        return { creator, createdAt, updatedAt, active };
    },
};

const NotificationConverter: firebase.firestore.FirestoreDataConverter<Notification> = {
    toFirestore: ({ id, ...notification }: Notification) => {
        return notification;
    },
    fromFirestore: (snapshot): Notification => {
        const data = snapshot.data(defaultSnapshotOptions);
        const base: Pick<Notification, 'id' | 'type' | 'actor' | 'createdAt' | 'seenAt' | 'readAt' | 'notifiedAt'> = {
            id: snapshot.id,
            type: data.type,
            actor: data.actor,
            createdAt: data.createdAt,
            seenAt: data.seenAt,
            readAt: data.readAt,
            notifiedAt: data.notifiedAt,
        };
        switch (base.type) {
            case 'CommentAddedNotification':
                return {
                    ...base,
                    type: base.type,
                    entityRef: addConverterToRef(data.entityRef),
                    parent: { ...data.parent, ref: addConverterToRef(data.parent.ref) },
                };
            case 'CommentLikedNotification':
                return {
                    ...base,
                    type: base.type,
                    entityRef: addConverterToRef(data.entityRef),
                    parent: { ...data.parent, ref: addConverterToRef(data.parent.ref) },
                };
            case 'TranslationAddedNotification':
                return {
                    ...base,
                    type: base.type,
                    entityRef: addConverterToRef(data.entityRef),
                    parent: { ...data.parent, ref: addConverterToRef(data.parent.ref) },
                };
            case 'TranslationExampleAddedNotification':
                return {
                    ...base,
                    type: base.type,
                    entityRef: addConverterToRef(data.entityRef),
                    parent: { ...data.parent, ref: addConverterToRef(data.parent.ref) },
                };
        }
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
    termRelations: db.collection('termRelations').withConverter(TermRelationConverter),
    termIndex: db.collection('termIndex').withConverter(TermIndexConverter),
    translationIndex: db.collection('translationIndex').withConverter(TranslationIndexConverter),
    translationExamples: db.collection('translationExamples').withConverter(TranslationExampleConverter),
    sources: db.collection('sources').withConverter(SourceConverter),
    sensitiveTerms: db.collection('sensitiveTerms').withConverter(SensitiveTermsConverter),
    comments: db.collection('comments').withConverter(CommentConverter),
    settings: db.collection('settings').withConverter(GlobalSettingsConverter),
    likes: db.collectionGroup('likes').withConverter(LikeConverter),
};

const addConverterToRef = <T extends Term | Translation | TranslationExample | Source | Comment>(
    ref: DocReference<T>
): DocReference<T> => {
    switch (ref.parent.id) {
        case 'terms':
            return ref.withConverter(TermConverter) as DocReference<T>;
        case 'translations':
            return ref.withConverter(TranslationConverter) as DocReference<T>;
        case 'translationExamples':
            return ref.withConverter(TranslationExampleConverter) as DocReference<T>;
        case 'sources':
            return ref.withConverter(SourceConverter) as DocReference<T>;
        case 'comments':
            return ref.withConverter(CommentConverter) as DocReference<T>;
        default:
            console.error(`Unknown parent ${ref.parent.id}`);
            return ref;
    }
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

export const getLikesRef = (commentId: string) =>
    collections.comments.doc(commentId).collection('likes').withConverter(LikeConverter);

export const getSubscriptionRef = (userId: string, termId: string) =>
    collections.terms.doc(termId).collection('subscriptions').withConverter(SubscriptionConverter).doc(userId);

export const getNotificationsRef = (userId: string) =>
    collections.users.doc(userId).collection('notifications').withConverter(NotificationConverter);

export const getSourceRefWithConverter = (ref: DocReference<Source>) => ref.withConverter(SourceConverter);

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
            translationsAsVariants: false,
            notOnlyPolitical: false,
        },
        adminComment: { langA: '', langB: '' },
        definition: { langA: '', langB: '' },
        creator: { id: user.id, displayName: user.displayName },
        createdAt: firebase.firestore.Timestamp.now(),
        guidelines: [],
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
        definition: { langA: '', langB: '' },
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
    return collections.comments.add({
        id: '',
        ref,
        creator: {
            id: user.id,
            displayName: user.displayName,
        },
        edited: null,
        createdAt: firebase.firestore.Timestamp.now(),
        comment,
        likeCount: 0,
    });
};

export const addLike = (user: User, likeRef: DocReference<Like>) =>
    likeRef.set({
        creator: {
            id: user.id,
            displayName: user.displayName,
        },
        createdAt: firebase.firestore.Timestamp.now(),
    });

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
