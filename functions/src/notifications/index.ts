import {
    Comment,
    CommentLikedNotification,
    DocReference,
    Like,
    Notification,
    Source,
    Term,
    Translation,
    TranslationExample,
} from '../../../src/types';
import { convertRef, convertRefToAdmin, db, functions, logger, WithoutId } from '../firebase';

const getEntityName = async (t: FirebaseFirestore.Transaction, entity: Term | Translation | TranslationExample) => {
    if ('value' in entity) {
        return entity.value;
    }

    const originalSource = (await t.get(convertRefToAdmin(entity.original.source as DocReference<Source>))).data();

    if (!originalSource) {
        return null;
    }

    return originalSource.title;
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
