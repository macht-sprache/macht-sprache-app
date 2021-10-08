import { DocumentSnapshot } from '@google-cloud/firestore';
import { firestore } from 'firebase-admin';
import { Change, EventContext } from 'firebase-functions';
import { clamp, equals, uniqWith } from 'rambdax';
import { RATING_STEPS } from '../../../src/constants';
import type { Comment, Lang, Rating, Term, Translation } from '../../../src/types';
import { db, functions, logger, WithoutId } from '../firebase';
import { findLemmas } from '../handlers/language';

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
            try {
                await ref.update({ commentCount: size });
            } catch (error) {
                logger.warn(`Updating ref ${ref.path} failed.`, { error });
            }
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

export const denormalizeLikes = functions.firestore
    .document('/comments/{commentId}/likes/{userId}')
    .onWrite(async (change, context) => {
        const commentRef = db.collection('comments').doc(context.params.commentId);
        const likesRef = commentRef.collection('likes');

        const [commentSnap, likesSnap] = await Promise.all([commentRef.get(), likesRef.get()]);
        const comment = commentSnap.data() as WithoutId<Comment> | undefined;

        if (!comment) {
            return;
        }

        await commentRef.update({ likeCount: likesSnap.size });
    });

type TranslationExamplePartial = {
    translation: firestore.DocumentReference;
    original: {
        source: firestore.DocumentReference;
    };
    translated: {
        source: firestore.DocumentReference;
    };
};

export const denormalizeSourceRefs = functions.firestore
    .document('/translationExamples/{translationExampleId}')
    .onWrite(async (change, { resource }) => {
        const before = change.before.data() as TranslationExamplePartial | undefined;
        const after = change.after.data() as TranslationExamplePartial | undefined;

        if (
            refsAreEqual(before?.original.source, after?.original.source) &&
            refsAreEqual(before?.translated.source, after?.original.source)
        ) {
            logger.info('No change to refs', { resource });
            return;
        }

        const sourceRefs = uniqueRefs([
            before?.original.source,
            after?.original.source,
            before?.translated.source,
            after?.original.source,
        ]);

        await Promise.all(
            sourceRefs.map(sourceRef =>
                db.runTransaction(async t => {
                    const examplesWithOriginalSnap = await t.get(
                        db.collection('translationExamples').where('original.source', '==', sourceRef)
                    );
                    const examplesWithTranslatedSnap = await t.get(
                        db.collection('translationExamples').where('translated.source', '==', sourceRef)
                    );
                    const exampleDocs = [
                        ...examplesWithOriginalSnap.docs,
                        ...examplesWithTranslatedSnap.docs,
                    ].map(doc => doc.data()) as TranslationExamplePartial[];

                    const translationRefs = uniqueRefs(exampleDocs.map(doc => doc?.translation));
                    const translationsSnap = translationRefs.length ? await t.getAll(...translationRefs) : [];
                    const termRefs = uniqueRefs(translationsSnap.map(snap => snap.data()?.term));

                    t.update(sourceRef, { refs: [...termRefs, ...translationRefs] });
                })
            )
        );
    });

type TermTranslationIndex = {
    ref: firestore.DocumentReference;
    lang: Lang;
    lemmas: string;
};

const getDenormalizeTermTranslationIndex = (collectionName: string) => async (
    change: Change<DocumentSnapshot>,
    { resource }: EventContext
) => {
    const before = change.before.data() as Term | Translation | undefined;
    const after = change.after.data() as Term | Translation | undefined;

    if (equals(getVariants(before), getVariants(after))) {
        logger.info('No change to variants', { resource });
        return;
    }

    const collection = db.collection(collectionName);

    if (!after) {
        logger.info('Deleting index', { resource });
        await collection.doc(change.before.ref.id).delete();
        return;
    }

    logger.info('Saving index', { resource });
    const termIndex = await getTermTranslationIndex(after, change.after.ref);
    await collection.doc(change.after.ref.id).set(termIndex);
};

export const denormalizeTermIndex = functions.firestore
    .document('/terms/{termId}')
    .onWrite(getDenormalizeTermTranslationIndex('/termIndex'));

export const denormalizeTranslationIndex = functions.firestore
    .document('/translations/{translationId}')
    .onWrite(getDenormalizeTermTranslationIndex('/translationIndex'));

const getVariants = (entity: Term | Translation | undefined) => {
    if (!entity) {
        return [];
    }
    return [entity.value, ...entity.variants];
};

const getTermTranslationIndex = async (
    term: Term | Translation,
    ref: firestore.DocumentReference
): Promise<TermTranslationIndex> => {
    const variants = getVariants(term);
    const lemmas = (await Promise.all(variants.map(variant => findLemmas(variant, term.lang)))).map(result =>
        result.map(({ lemma }) => lemma)
    );
    return {
        ref,
        lemmas: JSON.stringify(lemmas),
        lang: term.lang,
    };
};

const refsAreEqual = (a?: firestore.DocumentReference, b?: firestore.DocumentReference) =>
    a === b || !!(b && a?.isEqual(b));

const uniqueRefs = (refs: (firestore.DocumentReference | undefined)[]) =>
    uniqWith(
        refsAreEqual,
        refs.filter((ref): ref is firestore.DocumentReference => !!ref)
    );
