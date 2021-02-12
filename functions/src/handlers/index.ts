import { firestore } from 'firebase-admin';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import { TranslationExampleModel } from '../../../src/modelTypes';
import { Lang, Term, Translation, TranslationExample, User } from '../../../src/types';
import { convertRef, db, functions, WithoutId } from '../firebase';
import { ensureBookRef, searchBooks } from './books';
import { findTermMatches } from './language';

const verifyUser = (context: CallableContext) => {
    if (!context.auth?.uid || !context.auth?.token.email_verified) {
        throw new Error('User is not verified.');
    }
};

export const findBooks = functions.https.onCall(async ({ query, lang }: { query: string; lang: Lang }, context) => {
    verifyUser(context);
    return searchBooks(query, lang);
});

export const addTranslationExample = functions.https.onCall(async (model: TranslationExampleModel, context) => {
    verifyUser(context);

    const userId = context.auth?.uid!;

    const [termSnap, translationSnap, userSnap] = await Promise.all([
        db.collection('terms').doc(model.termId).get(),
        db.collection('translations').doc(model.translationId).get(),
        db.collection('users').doc(userId).get(),
    ]);
    const term = termSnap.data() as WithoutId<Term>;
    const translation = translationSnap.data() as WithoutId<Translation>;
    const user = userSnap.data() as WithoutId<User>;

    if (!term || !translation || !user) {
        throw Error('Term or translation or user missing.');
    }

    const [originalMatches, translatedMatches] = await Promise.all([
        findTermMatches(term.value, model.original.text, term.lang),
        findTermMatches(translation.value, model.translated.text, translation.lang),
    ]);

    const [originalBookRef, translatedBookRef] = await Promise.all([
        ensureBookRef(model.original.bookId),
        ensureBookRef(model.translated.bookId),
    ]);

    const translationExampleRef = db.collection('translationExamples').doc();

    const translationExample: WithoutId<TranslationExample> = {
        createdAt: firestore.Timestamp.now(),
        creator: {
            id: userId,
            displayName: user.displayName,
        },
        translation: convertRef(translationSnap.ref),
        type: model.type,
        original: {
            text: model.original.text,
            pageNumber: model.original.pageNumber,
            matches: originalMatches,
            source: convertRef(originalBookRef),
        },
        translated: {
            text: model.translated.text,
            pageNumber: model.translated.pageNumber,
            matches: translatedMatches,
            source: convertRef(translatedBookRef),
        },
        commentCount: 0,
    };

    await translationExampleRef.set(translationExample);

    return { translationExampleId: translationExampleRef.id };
});
