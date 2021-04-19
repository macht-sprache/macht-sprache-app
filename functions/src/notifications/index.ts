import {
    Comment,
    CommentLikedNotification,
    Like,
    Notification,
    Term,
    Translation,
    TranslationExample,
} from '../../../src/types';
import { convertRef, db, functions, logger, WithoutId } from '../firebase';

const getEntityName = async (entity: Term | Translation | TranslationExample) => {
    if ('value' in entity) {
        return entity.value;
    }

    const originalSource = (await entity.original.source.get()).data();

    if (!originalSource) {
        return null;
    }

    return originalSource.title;
};

const saveNotification = async (userId: string, notification: Notification) => {
    if (userId === notification.actor.id) {
        return logger.info(`Not notifiying user ${userId} about own action`);
    }

    await db.collection('users').doc(userId).collection('notifications').doc().set(notification);
};

export const createCommentLikedNotification = functions.firestore
    .document('/comments/{commentId}/likes/{userId}')
    .onCreate(async (snapshot, context) => {
        const like = snapshot.data() as Like;
        const commentRef = db.collection('comments').doc(context.params.commentId);
        const comment = ((await commentRef.get()).data() as WithoutId<Comment>) || undefined;

        if (!comment) {
            return logger.info(`Comment ${commentRef} deleted`);
        }

        const parentRef = comment.ref;
        const parentEntity = (await comment.ref.get()).data();

        if (!parentEntity) {
            return logger.info(`Parent ${parentRef} deleted`);
        }

        const parentName = await getEntityName(parentEntity);

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
            parentRef,
            parentName,
        };

        await saveNotification(comment.creator.id, notification);
    });

export const handleDeletedComment = functions.firestore.document('/comments/{commentId}').onDelete(async snap => {
    const commentRef = snap.ref;
    await db.runTransaction(async t => {
        const queryRef = await db.collectionGroup('notifications').where('entityRef', '==', commentRef);
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
            const queryRef = await db
                .collectionGroup('notifications')
                .where('entityRef', '==', commentRef)
                .where('actor.id', '==', actorId);
            const querySnap = await t.get(queryRef);
            querySnap.forEach(docSnap => t.delete(docSnap.ref));
        });
    });
