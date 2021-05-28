import { QueryDocumentSnapshot } from '@google-cloud/firestore';
import { Change } from 'firebase-functions';
import { equals } from 'rambdax';
import {
    Comment,
    CommentAddedNotification,
    CommentLikedNotification,
    Like,
    Notification,
    Subscription,
    Term,
    Translation,
    TranslationAddedNotification,
    TranslationExample,
    TranslationExampleAddedNotification,
} from '../../../src/types';
import { convertRef, convertRefToAdmin, db, functions, logger, WithoutId } from '../firebase';
import { getEntityInfo, getNewSubscription, getTermRefForParent } from './service';

const getActiveSubscriptions = async (
    t: FirebaseFirestore.Transaction,
    termRef: FirebaseFirestore.DocumentReference<Term>
): Promise<Subscription[]> => {
    const snap = await t.get(termRef.collection('subscriptions').where('active', '==', true));
    return snap.docs.map(doc => doc.data() as Subscription);
};

const saveNotification = (t: FirebaseFirestore.Transaction, userId: string, notification: WithoutId<Notification>) => {
    if (userId === notification.actor.id) {
        return logger.info(`Not notifiying user ${userId} about own action`);
    }

    t.set(db.collection('users').doc(userId).collection('notifications').doc(), notification);
};

const notifySubscribers = async (
    t: FirebaseFirestore.Transaction,
    termRef: FirebaseFirestore.DocumentReference<Term>,
    notification: WithoutId<Notification>
) => {
    const subscriptions = await getActiveSubscriptions(t, termRef);
    const actorSubSnap = await termRef.collection('subscriptions').doc(notification.actor.id).get();

    if (!actorSubSnap.exists) {
        logger.info(`Subscribing ${notification.actor.id} to ${termRef.path}`);
        const subscription: Subscription = {
            createdAt: notification.createdAt,
            updatedAt: null,
            creator: notification.actor,
            active: true,
        };
        t.set(actorSubSnap.ref, subscription);
    }

    logger.info(`Notifying ${subscriptions.length} users about ${notification.entityRef.path}`);

    subscriptions.forEach(subscription => {
        saveNotification(t, subscription.creator.id, notification);
    });
};

export const subscribeTermCreator = functions.firestore.document('/terms/{termId}').onCreate(async snapshot => {
    const term = snapshot.data() as WithoutId<Term>;
    const subscriptionRef = snapshot.ref.collection('subscriptions').doc(term.creator.id);
    await subscriptionRef.set(getNewSubscription(term));
});

export const createCommentLikedNotification = functions.firestore
    .document('/comments/{commentId}/likes/{userId}')
    .onCreate(async (snapshot, context) => {
        const like = snapshot.data() as Like;
        const commentRef = db.collection('comments').doc(context.params.commentId);

        await db.runTransaction(async t => {
            const comment = ((await t.get(commentRef)).data() as WithoutId<Comment>) || undefined;

            if (!comment) {
                return logger.info(`Comment ${commentRef.path} deleted`);
            }

            const parentRef = convertRefToAdmin(comment.ref);
            const parentEntity = (await t.get(parentRef)).data();

            if (!parentEntity) {
                return logger.info(`Parent ${parentRef.path} deleted`);
            }

            const parentInfo = await getEntityInfo(t, parentEntity);
            if (!parentInfo) {
                return logger.info(`Couldn't get info for ${parentRef.path}`);
            }

            const notification: WithoutId<CommentLikedNotification> = {
                type: 'CommentLikedNotification',
                actor: like.creator,
                createdAt: like.createdAt,
                seenAt: null,
                readAt: null,
                notifiedAt: null,

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
                return logger.info(`Parent ${parentRef.path} deleted`);
            }

            const parentInfo = await getEntityInfo(t, parentEntity);
            if (!parentInfo) {
                return logger.info(`Couldn't get info for ${parentRef.path}`);
            }

            const termForParent = await getTermRefForParent(t, parentRef, parentEntity);
            if (!termForParent) {
                return logger.info(`Couldn't get term for ${parentRef.path}`);
            }

            const notification: WithoutId<CommentAddedNotification> = {
                type: 'CommentAddedNotification',
                actor: comment.creator,
                createdAt: comment.createdAt,
                seenAt: null,
                readAt: null,
                notifiedAt: null,

                entityRef: convertRef(snap.ref),
                parent: {
                    ...parentInfo,
                    ref: convertRef(parentRef),
                },
            };

            await notifySubscribers(t, termForParent, notification);
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

            const notification: WithoutId<TranslationAddedNotification> = {
                type: 'TranslationAddedNotification',
                actor: translation.creator,
                createdAt: translation.createdAt,
                seenAt: null,
                readAt: null,
                notifiedAt: null,

                entityRef: convertRef(translationRef),
                parent: {
                    ref: translation.term,
                    name: term.value,
                    lang: term.lang,
                },
            };

            await notifySubscribers(t, termRef, notification);
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
                return logger.info(`Parent ${parentRef.path} deleted`);
            }

            const parentInfo = await getEntityInfo(t, parentEntity);
            if (!parentInfo) {
                return logger.info(`Couldn't get info for ${parentRef.path}`);
            }

            const termForParent = await getTermRefForParent(t, parentRef, parentEntity);
            if (!termForParent) {
                return logger.info(`Couldn't get term for ${parentRef.path}`);
            }

            const notification: WithoutId<TranslationExampleAddedNotification> = {
                type: 'TranslationExampleAddedNotification',
                actor: translationExample.creator,
                createdAt: translationExample.createdAt,
                seenAt: null,
                readAt: null,
                notifiedAt: null,

                entityRef: convertRef(snap.ref),
                parent: {
                    ...parentInfo,
                    ref: convertRef(parentRef),
                },
            };

            await notifySubscribers(t, termForParent, notification);
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
        logger.info(`Updating ${notificationsSnap.size} notifications for ${ref.path}`);
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

export { notificationMailTask } from './task';
