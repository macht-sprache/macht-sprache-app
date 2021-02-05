import type { Comment } from '../../../src/types';
import { db, functions, logger } from '../firebase';

export const denormalizeCommentCount = functions.firestore
    .document('/comments/{commentId}')
    .onWrite(async (change, { resource }) => {
        const before = change.before.data() as Comment | undefined;
        const after = change.after.data() as Comment | undefined;

        if (before && after?.ref.isEqual(before.ref)) {
            logger.info('No change to ref', { resource });
            return;
        }

        logger.info('Denormalizing comment counts', { resource });
        const refs = [before?.ref, after?.ref].filter((ref): ref is Comment['ref'] => !!ref);

        for (const ref of refs) {
            const { size } = await db.collection('comments').select('ref').where('ref', '==', ref).get();
            await ref.update({ commentCount: size });
        }
    });
