import { DocumentReference, QueryDocumentSnapshot } from '@google-cloud/firestore';
import { firestore } from 'firebase-admin';
import { clamp, uniqWith, take } from 'rambdax';
import { RATING_STEPS } from '../../../src/constants';
import type { Comment, Rating, Translation } from '../../../src/types';
import { db, functions, logger, WithoutId } from '../firebase';

type Term = {
    relatedTerms: DocumentReference<Term>[];
};

type TermRelation = {
    terms: [DocumentReference<Term>, DocumentReference<Term>];
};

const denormalizeTermRelations = async (
    snapshot: QueryDocumentSnapshot,
    updateFn: (
        term: Term,
        termRef: DocumentReference<Term>,
        termRefs: DocumentReference<Term>[]
    ) => DocumentReference<Term>[]
) => {
    const termRelation = snapshot.data() as TermRelation;
    const termRefs = take(2, termRelation.terms);

    await db.runTransaction(async t => {
        const termSnaps = await t.getAll(...termRefs);
        termSnaps.forEach(termSnap => {
            const term = termSnap.data();
            if (!term) {
                return;
            }

            t.update(termSnap.ref, {
                relatedTerms: uniqueRefs(updateFn(term, termSnap.ref, termRefs)),
            });
        });
    });
};

export const denormalizeTermRelationsCreate = functions.firestore
    .document('/termRelations/{termRelationsId}')
    .onCreate(async (snapshot, { resource }) => {
        logger.info('Denormalizing related terms on termRelation create', { resource });

        await denormalizeTermRelations(snapshot, (term, termRef, termRefs) =>
            [...term.relatedTerms, ...termRefs].filter(ref => !ref.isEqual(termRef))
        );
    });

export const denormalizeTermRelationsDelete = functions.firestore
    .document('/termRelations/{termRelationsId}')
    .onDelete(async (snapshot, { resource }) => {
        logger.info('Denormalizing related terms on termRelation delete', { resource });

        await denormalizeTermRelations(snapshot, (term, termRef, termRefs) =>
            term.relatedTerms.filter(ref => !termRefs.some(termRef => termRef.isEqual(ref)))
        );
    });

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

export { denormalizeTermIndex, denormalizeTranslationIndex } from './termTranslationIndex';

const refsAreEqual = (a?: firestore.DocumentReference, b?: firestore.DocumentReference) =>
    a === b || !!(b && a?.isEqual(b));

const uniqueRefs = (refs: (firestore.DocumentReference | undefined)[]) =>
    uniqWith(
        refsAreEqual,
        refs.filter((ref): ref is firestore.DocumentReference => !!ref)
    );
