import {
    Comment,
    CommentAddedNotification,
    CommentLikedNotification,
    DocReference,
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

const getEntityName = async (t: FirebaseFirestore.Transaction, entity: ParentEntity) => {
    if ('value' in entity) {
        return entity.value;
    }

    const originalSource = (await t.get(convertRefToAdmin(entity.original.source as DocReference<Source>))).data();

    if (!originalSource) {
        return null;
    }

    return originalSource.title;
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

            const parentName = await getEntityName(t, parentEntity);

            if (!parentName) {
                return logger.info(`Couldn't get name for ${parentRef}`);
            }

            const notification: CommentLikedNotification = {
                type: 'CommentLikedNotification',
                actor: like.creator,
                createdAt: like.createdAt,
                seenAt: null,
                readAt: null,

                entityRef: convertRef(commentRef),
                parentRef: convertRef(parentRef),
                parentName,
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

            const parentName = await getEntityName(t, parentEntity);
            if (!parentName) {
                return logger.info(`Couldn't get name for ${parentRef}`);
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
                parentRef: comment.ref,
                parentName,
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
                parentRef: translation.term,
                parentName: term.value,
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

            const parentName = await getEntityName(t, parentEntity);
            if (!parentName) {
                return logger.info(`Couldn't get name for ${parentRef}`);
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
                parentRef: convertRef(parentRef),
                parentName,
            };

            const subscriptions = await getSubscriptions(t, termForParent);

            logger.info(`Notifying ${subscriptions.length} users about ${snap.ref}`);

            subscriptions.forEach(subscription => {
                saveNotification(t, subscription.creator.id, notification);
            });
        });
    });

export const handleDeletedComment = functions.firestore.document('/comments/{commentId}').onDelete(async snap => {
    const commentRef = snap.ref;
    await db.runTransaction(async t => {
        const queryRef = db.collectionGroup('notifications').where('entityRef', '==', commentRef);
        const querySnap = await t.get(queryRef);
        querySnap.forEach(docSnap => t.delete(docSnap.ref));
    });
});

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
