import { QuerySnapshot } from '@google-cloud/firestore';
import { logger } from 'firebase-functions';
import { filterAsync, mapAsync, sortBy, toPairs, uniqWith } from 'rambdax';
import { Comment, Subscription, Term, Translation, TranslationExample } from '../../../src/types';
import { convertRefToAdmin, db } from '../firebase';
import { getNewSubscription, getTermRefForParent } from './service';

export const seedSubscriptions = async () => {
    const terms = (await db.collection('terms').get()) as QuerySnapshot<Term>;
    const subscriptionsByTermId = terms.docs.reduce<{ [termId: string]: Subscription[] }>(
        (acc, cur) => ({
            ...acc,
            [cur.id]: [getNewSubscription(cur.data())],
        }),
        {}
    );

    const translations = (await db.collection('translations').get()) as QuerySnapshot<Translation>;
    const translationExamples = (await db.collection('translationExamples').get()) as QuerySnapshot<TranslationExample>;
    const comments = (await db.collection('comments').get()) as QuerySnapshot<Comment>;

    for (const doc of translations.docs) {
        const translation = doc.data();
        subscriptionsByTermId[translation.term.id]?.push(getNewSubscription(translation));
    }

    for (const doc of translationExamples.docs) {
        const translationExample = doc.data();
        const translationSnap = await translationExample.translation.get();
        const translation = translationSnap.data();

        if (!translation) {
            continue;
        }

        subscriptionsByTermId[translation.term.id]?.push(getNewSubscription(translationExample));
    }

    for (const doc of comments.docs) {
        const comment = doc.data();
        const termRef = await db.runTransaction(async t => {
            const parentSnap = await convertRefToAdmin(comment.ref).get();
            const parent = parentSnap.data();
            if (!parent) {
                return;
            }
            return getTermRefForParent(t, parentSnap.ref, parent);
        });

        if (termRef) {
            subscriptionsByTermId[termRef.id]?.push(getNewSubscription(comment));
        }
    }

    const addedSubscriptionsByTermId = await mapAsync(
        async ([termId, subscriptions]) =>
            db.runTransaction(async t => {
                const subscriptionsRef = db.collection('terms').doc(termId).collection('subscriptions');
                const sortedSubscriptions = sortBy(sub => sub.createdAt.toMillis(), subscriptions);
                const uniqueSubscriptions = uniqWith((a, b) => a.creator.id === b.creator.id, sortedSubscriptions);
                const newSubscriptions = await filterAsync(async sub => {
                    const snap = await subscriptionsRef.doc(sub.creator.id).get();
                    return !snap.exists;
                }, uniqueSubscriptions);
                newSubscriptions.forEach(sub => t.create(subscriptionsRef.doc(sub.creator.id), sub));
                return [termId, newSubscriptions];
            }),
        toPairs(subscriptionsByTermId)
    );

    addedSubscriptionsByTermId.forEach(([termId, subs]) =>
        logger.info(`Added ${subs.length} subscriptions for term ${termId}`)
    );
};
