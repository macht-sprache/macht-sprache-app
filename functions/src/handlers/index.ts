import { firestore } from 'firebase-admin';
import { TranslationExampleModel } from '../../../src/modelTypes';
import {
    BookSource,
    Lang,
    MovieSource,
    Source,
    SourceMediaForType,
    SourceType,
    Term,
    Translation,
    TranslationExample,
    User,
    WebPageSource,
} from '../../../src/types';
import { convertRef, db, functions, verifyUser, WithoutId } from '../firebase';
import { getBook, searchBooks } from './books';
import { findTermMatches, findLemmas } from './language';
import { getMovie, searchMovies } from './movies';
import { getWebPage, searchWebPage } from './webpages';

export const analyzeText = functions.https.onCall(async ({ text, lang }: { text: string; lang: Lang }, context) => {
    verifyUser(context);
    return findLemmas(text, lang);
});

export const findBooks = functions.https.onCall(async ({ query, lang }: { query: string; lang: Lang }, context) => {
    verifyUser(context);
    return searchBooks(query, lang);
});

export const findMovies = functions.https.onCall(async ({ query, lang }: { query: string; lang: Lang }, context) => {
    verifyUser(context);
    return searchMovies(query, lang);
});

export const findWebPage = functions.https.onCall(async ({ url, lang }: { url: string; lang: Lang }, context) => {
    verifyUser(context);
    return searchWebPage(url, lang);
});

export const addTranslationExample = functions.https.onCall(async (model: TranslationExampleModel, context) => {
    const userId = verifyUser(context);
    const translationExampleRef = db.collection('translationExamples').doc();
    await translationExampleRef.set(await getTranslationExample(model, userId));
    return { translationExampleId: translationExampleRef.id };
});

async function getTranslationExample(
    model: TranslationExampleModel,
    userId: string
): Promise<WithoutId<TranslationExample>> {
    const [termSnap, translationSnap, userSnap] = await Promise.all([
        db.collection('terms').doc(model.termId).get(),
        db.collection('translations').doc(model.translationId).get(),
        db.collection('users').doc(userId).get(),
    ]);
    const term = termSnap.data() as WithoutId<Term>;
    const translation = translationSnap.data() as WithoutId<Translation>;
    const user = userSnap.data() as WithoutId<User>;

    if (!term || !translation || !user) {
        throw new Error('Term or translation or user missing.');
    }

    const [originalMatches, translatedMatches] = await Promise.all([
        findTermMatches(term.value, model.original.text, term.lang),
        findTermMatches(translation.value, model.translated.text, translation.lang),
    ]);

    const baseExample = {
        createdAt: firestore.Timestamp.now(),
        creator: {
            id: userId,
            displayName: user.displayName,
        },
        translation: convertRef<Translation>(translationSnap.ref),
        commentCount: 0,
    };

    switch (model.type) {
        case 'BOOK':
            const [originalBookRef, translatedBookRef] = await Promise.all([
                writeSource(model.original.sourceId, model.type, getBook),
                writeSource(model.translated.sourceId, model.type, getBook),
            ]);
            return {
                ...baseExample,
                type: model.type,
                original: {
                    text: model.original.text,
                    pageNumber: model.original.pageNumber,
                    matches: originalMatches,
                    source: convertRef<BookSource>(originalBookRef),
                },
                translated: {
                    text: model.translated.text,
                    pageNumber: model.translated.pageNumber,
                    matches: translatedMatches,
                    source: convertRef<BookSource>(translatedBookRef),
                },
            };
        case 'MOVIE':
            const [originalMovieRef, translatedMovieRef] = await Promise.all([
                writeSource(model.original.sourceId, model.type, getMovie),
                writeSource(model.translated.sourceId, model.type, getMovie),
            ]);
            return {
                ...baseExample,
                type: model.type,
                original: {
                    text: model.original.text,
                    matches: originalMatches,
                    source: convertRef<MovieSource>(originalMovieRef),
                },
                translated: {
                    text: model.translated.text,
                    matches: translatedMatches,
                    source: convertRef<MovieSource>(translatedMovieRef),
                },
            };
        case 'WEBPAGE':
            const [originalWebPageRef, translatedWebPageRef] = await Promise.all([
                writeSource(model.original.sourceId, model.type, getWebPage),
                writeSource(model.translated.sourceId, model.type, getWebPage),
            ]);
            return {
                ...baseExample,
                type: model.type,
                original: {
                    text: model.original.text,
                    matches: originalMatches,
                    source: convertRef<WebPageSource>(originalWebPageRef),
                },
                translated: {
                    text: model.translated.text,
                    matches: translatedMatches,
                    source: convertRef<WebPageSource>(translatedWebPageRef),
                },
            };
    }
}

async function writeSource<T extends SourceType>(
    sourceId: string,
    sourceType: T,
    getSource: (sourceId: string) => Promise<SourceMediaForType<T>>
) {
    const sourceRef = db.collection('sources').doc(sourceId);
    const sourceMedium = (await sourceRef.get()).data() as WithoutId<Source> | undefined;

    if (!sourceMedium) {
        const { id, ...sourceMedia } = await getSource(sourceId);
        const newSource = {
            ...sourceMedia,
            type: sourceType,
            refs: [],
        };
        await sourceRef.set(newSource);
    }

    return sourceRef;
}
