import { clamp } from 'rambdax';
import type { Comment, Rating, Translation } from '../../../src/types';
import { RATING_STEPS } from '../../../src/constants';
import { db, functions, logger, WithoutId } from '../firebase';

export const denormalizeCommentCount = functions.firestore
    .document('/comments/{commentId}')
    .onWrite(async (change, { resource }) => {
        const before = change.before.data() as WithoutId<Comment> | undefined;
        const after = change.after.data() as WithoutId<Comment> | undefined;

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

export const denormalizeRatings = functions.firestore
    .document('/translations/{translationId}/ratings/{userId}')
    .onWrite(async (change, context) => {
        const translationRef = db.collection('translations').doc(context.params.translationId);
        const ratingsRef = translationRef.collection('ratings');

        const [translationSnap, ratingsSnap] = await Promise.all([translationRef.get(), ratingsRef.get()]);
        const translation = translationSnap.data() as WithoutId<Translation> | undefined;

        if (!translation) {
            return;
        }

        const individualRatings = ratingsSnap.docs.map(value => value.data() as Rating);
        const ratingDistribution = individualRatings.reduce((acc, cur) => {
            const rating = clamp(0, 1, cur.rating);
            const ratingindex = Math.round(rating * (acc.length - 1));
            acc[ratingindex]++;
            return acc;
        }, Array<number>(RATING_STEPS).fill(0));

        await translationRef.update({ ratings: ratingDistribution });
    });
