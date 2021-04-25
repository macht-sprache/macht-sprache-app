import { QueryDocumentSnapshot } from '@google-cloud/firestore';
import { Change } from 'firebase-functions';
import { equals } from 'rambdax';
import {
    Comment,
    CommentAddedNotification,
    CommentLikedNotification,
    DocReference,
    Lang,
    Like,
    Notification,
    Source,
    Subscription,
    Term,
    Translation,
    TranslationAddedNotification,
    TranslationExample,
    TranslationExampleAddedNotification,
} from '../../../src/types';
import { convertRef, convertRefToAdmin, db, functions, logger, WithoutId } from '../firebase';

type ParentEntity = Term | Translation | TranslationExample;
type ParentEntityRef = FirebaseFirestore.DocumentReference<ParentEntity>;

const getEntityInfo = async (
    t: FirebaseFirestore.Transaction,
    entity: ParentEntity
): Promise<{ name: string; lang: Lang } | null> => {
    if ('value' in entity) {
        return {
            name: entity.value,
            lang: entity.lang,
        };
    }

    const originalSource = (await t.get(convertRefToAdmin(entity.original.source as DocReference<Source>))).data();

    if (!originalSource) {
        return null;
    }

    return {
        name: originalSource.title,
        lang: originalSource.lang,
    };
};

const getTermRefForParent = async (
    t: FirebaseFirestore.Transaction,
    parentRef: ParentEntityRef,
    parentEntity: ParentEntity
): Promise<FirebaseFirestore.DocumentReference<Term> | undefined> => {
    if ('term' in parentEntity) {
        return convertRefToAdmin(parentEntity.term);
    }

    if ('translation' in parentEntity) {
        const translation = (await t.get(convertRefToAdmin(parentEntity.translation))).data();
        return translation && convertRefToAdmin(translation.term);
    }

    return parentRef as FirebaseFirestore.DocumentReference<Term>;
};

const getSubscriptions = async (
    t: FirebaseFirestore.Transaction,
    termRef: FirebaseFirestore.DocumentReference<Term>
): Promise<Subscription[]> => {
    const snap = await t.get(termRef.collection('subscriptions'));
    return snap.docs.map(doc => doc.data() as Subscription);
};

const saveNotification = (t: FirebaseFirestore.Transaction, userId: string, notification: Notification) => {
    if (userId === notification.actor.id) {
        return logger.info(`Not notifiying user ${userId} about own action`);
    }

    t.set(db.collection('users').doc(userId).collection('notifications').doc(), notification);
};

export const createCommentLikedNotification = functions.firestore
    .document('/comments/{commentId}/likes/{userId}')
    .onCreate(async (snapshot, context) => {
        const like = snapshot.data() as Like;
        const commentRef = db.collection('comments').doc(context.params.commentId);

        await db.runTransaction(async t => {
            const comment = ((await t.get(commentRef)).data() as WithoutId<Comment>) || undefined;

            if (!comment) {
                return logger.info(`Comment ${commentRef} deleted`);
            }

            const parentRef = convertRefToAdmin(comment.ref);
            const parentEntity = (await t.get(parentRef)).data();

            if (!parentEntity) {
                return logger.info(`Parent ${parentRef} deleted`);
            }

            const parentInfo = await getEntityInfo(t, parentEntity);
            if (!parentInfo) {
                return logger.info(`Couldn't get info for ${parentRef}`);
            }

            const notification: CommentLikedNotification = {
                type: 'CommentLikedNotification',
                actor: like.creator,
                createdAt: like.createdAt,
                seenAt: null,
                readAt: null,

                entityRef: convertRef(commentRef),
                parent: {
                    ...parentInfo,
                    ref: convertRef(parentRef),
                },
            };

            saveNotification(t, comment.creator.id, notification);
        });
    });

export const createCommentAddedNotification = functions.firestore
    .document('/comments/{commentId}')
    .onCreate(async snap => {
        await db.runTransaction(async t => {
            const comment = snap.data() as WithoutId<Comment>;
            const parentRef = convertRefToAdmin(comment.ref);
            const parentEntity = (await t.get(parentRef)).data();
            if (!parentEntity) {
                return logger.info(`Parent ${parentRef} deleted`);
            }

            const parentInfo = await getEntityInfo(t, parentEntity);
            if (!parentInfo) {
                return logger.info(`Couldn't get info for ${parentRef}`);
            }

            const termForParent = await getTermRefForParent(t, parentRef, parentEntity);
            if (!termForParent) {
                return logger.info(`Couldn't get term for ${parentRef}`);
            }

            const notification: CommentAddedNotification = {
                type: 'CommentAddedNotification',
                actor: comment.creator,
                createdAt: comment.createdAt,
                seenAt: null,
                readAt: null,

                entityRef: convertRef(snap.ref),
                parent: {
                    ...parentInfo,
                    ref: convertRef(parentRef),
                },
            };

            const subscriptions = await getSubscriptions(t, termForParent);

            logger.info(`Notifying ${subscriptions.length} users about ${snap.ref}`);

            subscriptions.forEach(subscription => {
                saveNotification(t, subscription.creator.id, notification);
            });
        });
    });

export const createTranslationAddedNotification = functions.firestore
    .document('/translations/{translationId}')
    .onCreate(async snap => {
        await db.runTransaction(async t => {
            const translationRef = snap.ref;
            const translation = snap.data() as WithoutId<Translation>;
            const termRef = convertRefToAdmin(translation.term);
            const term = (await t.get(termRef)).data();
            if (!term) {
                return logger.info(`Term ${termRef} deleted`);
            }

            const notification: TranslationAddedNotification = {
                type: 'TranslationAddedNotification',
                actor: translation.creator,
                createdAt: translation.createdAt,
                seenAt: null,
                readAt: null,

                entityRef: convertRef(translationRef),
                parent: {
                    ref: translation.term,
                    name: term.value,
                    lang: term.lang,
                },
            };

            const subscriptions = await getSubscriptions(t, termRef);

            logger.info(`Notifying ${subscriptions.length} users about ${translationRef}`);

            subscriptions.forEach(subscription => {
                saveNotification(t, subscription.creator.id, notification);
            });
        });
    });

export const createTranslationExampleAddedNotification = functions.firestore
    .document('/translationExamples/{translationExampleId}')
    .onCreate(async snap => {
        await db.runTransaction(async t => {
            const translationExample = snap.data() as WithoutId<TranslationExample>;
            const parentRef = convertRefToAdmin(translationExample.translation);

            const parentEntity = (await t.get(parentRef)).data();
            if (!parentEntity) {
                return logger.info(`Parent ${parentRef} deleted`);
            }

            const parentInfo = await getEntityInfo(t, parentEntity);
            if (!parentInfo) {
                return logger.info(`Couldn't get info for ${parentRef}`);
            }

            const termForParent = await getTermRefForParent(t, parentRef, parentEntity);
            if (!termForParent) {
                return logger.info(`Couldn't get term for ${parentRef}`);
            }

            const notification: TranslationExampleAddedNotification = {
                type: 'TranslationExampleAddedNotification',
                actor: translationExample.creator,
                createdAt: translationExample.createdAt,
                seenAt: null,
                readAt: null,

                entityRef: convertRef(snap.ref),
                parent: {
                    ...parentInfo,
                    ref: convertRef(parentRef),
                },
            };

            const subscriptions = await getSubscriptions(t, termForParent);

            logger.info(`Notifying ${subscriptions.length} users about ${snap.ref}`);

            subscriptions.forEach(subscription => {
                saveNotification(t, subscription.creator.id, notification);
            });
        });
    });

const handleDeletedEntity = async ({ ref }: FirebaseFirestore.QueryDocumentSnapshot) => {
    await db.runTransaction(async t => {
        const queryRef = db.collectionGroup('notifications').where('entityRef', '==', ref);
        const querySnap = await t.get(queryRef);
        querySnap.forEach(docSnap => t.delete(docSnap.ref));
    });
};

export const handleDeletedComment = functions.firestore.document('/comments/{commentId}').onDelete(handleDeletedEntity);
export const handleDeletedTranslation = functions.firestore
    .document('/translations/{translationId}')
    .onDelete(handleDeletedEntity);
export const handleDeletedTranslationExample = functions.firestore
    .document('/translationExamples/{translationExampleId}')
    .onDelete(handleDeletedEntity);

const handleChanged = async (change: Change<QueryDocumentSnapshot>) => {
    const newData = change.after.data();
    const oldData = change.before.data();
    const ref = change.after.ref;
    const newParentInfo = {
        name: newData.value,
        lang: newData.lang,
    };
    const oldParentInfo = {
        name: oldData.value,
        lang: oldData.lang,
    };
    if (equals(oldParentInfo, newParentInfo)) {
        return;
    }

    await db.runTransaction(async t => {
        const notificationsSnap = await t.get(db.collectionGroup('notifications').where('parent.ref', '==', ref));
        logger.info(`Updating ${notificationsSnap.size} notifications for ${ref}`);
        notificationsSnap.forEach(doc => t.update(doc.ref, { parent: { ...newParentInfo, ref: ref } }));
    });
};
export const handleChangedTerm = functions.firestore.document('/terms/{termId}').onUpdate(handleChanged);
export const handleChangedTranslation = functions.firestore
    .document('/translations/{translationId}')
    .onUpdate(handleChanged);

export const handleDeletedLike = functions.firestore
    .document('/comments/{commentId}/likes/{actorId}')
    .onDelete(async (snap, context) => {
        const commentRef = db.collection('comments').doc(context.params.commentId);
        const { actorId } = context.params;

        await db.runTransaction(async t => {
            const queryRef = db
                .collectionGroup('notifications')
                .where('entityRef', '==', commentRef)
                .where('actor.id', '==', actorId);
            const querySnap = await t.get(queryRef);
            querySnap.forEach(docSnap => t.delete(docSnap.ref));
        });
    });
