import { CollectionReference, DocumentSnapshot } from '@google-cloud/firestore';
import { firestore } from 'firebase-admin';
import { Change, EventContext } from 'firebase-functions';
import { equals, sortBy } from 'rambdax';
import { split } from 'unicode-default-word-boundary';
import type { Lang, Term, Translation } from '../../../src/types';
import { db, functions, logger } from '../firebase';
import { getGeneratedVariants } from './generateVariants';

type TermTranslation = Pick<Term | Translation, 'value' | 'variants' | 'lang'>;

type TermTranslationIndex = {
    ref: firestore.DocumentReference;
    lang: Lang;
    lemmas: string;
};

const getDenormalizeTermTranslationIndex = (indexCollection: CollectionReference) => async (
    change: Change<DocumentSnapshot>,
    { resource }: EventContext
) => {
    const before = change.before.data() as TermTranslation | undefined;
    const after = change.after.data() as TermTranslation | undefined;

    if (equals(getVariants(before), getVariants(after))) {
        logger.info('No change to variants', { resource });
        return;
    }

    if (!after) {
        logger.info('Deleting index', { resource });
        await indexCollection.doc(change.before.ref.id).delete();
        return;
    }

    logger.info('Saving index', { resource });
    await saveTermTranslationIndex(indexCollection, after, change.after.ref);
};

const termIndexCollection = db.collection('termIndex');
const translationIndexCollection = db.collection('translationIndex');

export const denormalizeTermIndex = functions.firestore
    .document('/terms/{termId}')
    .onWrite(getDenormalizeTermTranslationIndex(termIndexCollection));

export const denormalizeTranslationIndex = functions.firestore
    .document('/translations/{translationId}')
    .onWrite(getDenormalizeTermTranslationIndex(translationIndexCollection));

export const seedTermTranslationIndex = async () => {
    const [termsSnap, translationsSnap] = await Promise.all([
        db.collection('terms').get(),
        db.collection('translations').get(),
    ]);

    await Promise.all([
        ...termsSnap.docs.map(snap =>
            saveTermTranslationIndex(termIndexCollection, snap.data() as TermTranslation, snap.ref)
        ),
        ...translationsSnap.docs.map(snap =>
            saveTermTranslationIndex(translationIndexCollection, snap.data() as TermTranslation, snap.ref)
        ),
    ]);
};

const saveTermTranslationIndex = async (
    collection: CollectionReference,
    termTranslation: TermTranslation,
    ref: firestore.DocumentReference
) => {
    const index = await getTermTranslationIndex(termTranslation, ref);
    await collection.doc(ref.id).set(index);
};

const getVariants = (entity: TermTranslation | undefined) => {
    if (!entity) {
        return [];
    }
    return [entity.value, ...getGeneratedVariants(entity), ...entity.variants];
};

const getTermTranslationIndex = async (
    term: TermTranslation,
    ref: firestore.DocumentReference
): Promise<TermTranslationIndex> => {
    const variants = getVariants(term);
    const lemmas = sortBy(
        l => l.length,
        variants.map(v =>
            split(v)
                .flatMap(string => string.split(/(:)/g)) // to mimic Google NLP's behaviour
                .map(v => v.trim())
                .filter(v => v)
        )
    ).reverse();
    return {
        ref,
        lemmas: JSON.stringify(lemmas),
        lang: term.lang,
    };
};
