import { LanguageServiceClient } from '@google-cloud/language';
import { firestore } from 'firebase-admin';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import { books_v1, google } from 'googleapis';
import { all, isNil, isValid, last, partition, slice, zip } from 'rambdax';
import { TranslationExampleModel } from '../../../src/modelTypes';
import { Book, Lang, Term, Translation, TranslationExample, User } from '../../../src/types';
import { db, functions } from '../firebase';

type WithoutId<T> = Omit<T, 'id'>;

const booksApi = google.books('v1');
const languageClient = new LanguageServiceClient();

const verifyUser = (context: CallableContext) => {
    if (!context.auth?.uid || !context.auth?.token.email_verified) {
        throw new Error('User is not verified.');
    }
};

const BookSchema = {
    id: String,
    title: String,
    authors: [String],
    'publisher?': String,
    year: Number,
    isbn: String,
    'coverUrl?': String,
};

const isValidBook = (book: object): book is Book => isValid({ input: book, schema: BookSchema });

const volumeToBook = ({ id, volumeInfo }: books_v1.Schema$Volume): Partial<Book> => {
    const year = volumeInfo?.publishedDate?.match(/^\d+/)?.[0];
    return {
        id: id ?? undefined,
        title: volumeInfo?.title,
        authors: volumeInfo?.authors,
        publisher: volumeInfo?.publisher,
        year: typeof year == 'string' ? parseInt(year) : undefined,
        isbn: volumeInfo?.industryIdentifiers?.find(identifier => identifier.type?.startsWith('ISBN'))?.identifier,
        coverUrl: getCover(volumeInfo),
    };
};

const getCover = (volumeInfo: books_v1.Schema$Volume['volumeInfo']) => {
    const imageLinks = volumeInfo?.imageLinks;
    const cover =
        imageLinks?.extraLarge ||
        imageLinks?.large ||
        imageLinks?.medium ||
        imageLinks?.small ||
        imageLinks?.thumbnail ||
        imageLinks?.smallThumbnail;
    return cover?.replace('http://', 'https://');
};

export const findBooks = functions.https.onCall(async ({ query, lang }: { query: string; lang: Lang }, context) => {
    verifyUser(context);

    const { data } = await booksApi.volumes.list({
        langRestrict: lang,
        q: query,
        printType: 'books',
        maxResults: 20,
        orderBy: 'relevance',
    });
    const volumes = data.items || [];
    const books = volumes.map(volumeToBook).filter(isValidBook);
    return books;
});

const getBook = async (id: string) => {
    const { data } = await booksApi.volumes.get({ volumeId: id });
    const maybeBook = volumeToBook(data);

    if (isValidBook(maybeBook)) {
        return maybeBook;
    }

    throw new Error(`Book ${id} not found.`);
};

const findTermMatches = async (term: string, snippet: string, language: Lang) => {
    const content = term + '\n\n' + snippet;

    const [{ tokens }] = await languageClient.analyzeSyntax({
        document: {
            type: 'PLAIN_TEXT',
            content,
            language,
        },
        encodingType: 'UTF16',
    });

    if (!tokens) {
        return [];
    }

    const [termTokens, snippetTokens] = partition(({ text }) => {
        const beginOffset = text?.beginOffset;
        return !isNil(beginOffset) && beginOffset <= term.length;
    }, tokens);

    const termMatches = snippetTokens.reduce<string[]>((prev, cur, index) => {
        const snippetTokensToMatch = snippetTokens.slice(index, index + termTokens.length);
        const tokenPairs = zip(termTokens, snippetTokensToMatch);
        if (
            tokenPairs.length === termTokens.length &&
            all(
                ([termToken, snippetToken]) => termToken.lemma?.toLowerCase() === snippetToken.lemma?.toLowerCase(),
                tokenPairs
            )
        ) {
            const startIndex = cur.text?.beginOffset;
            const lastToken = last(snippetTokensToMatch);
            const endIndex = (lastToken.text?.beginOffset || 0) + (lastToken.text?.content?.length || 0);

            if (typeof startIndex === 'number') {
                prev.push(slice(startIndex, endIndex, content));
            }
        }
        return prev;
    }, []);

    return termMatches;
};

const ensureBookRef = async (bookId: string) => {
    const bookRef = db.collection('books').doc(bookId);
    const bookSnap = await bookRef.get();

    if (!bookSnap.exists) {
        const { id, ...bookEntity } = await getBook(bookId);
        await bookRef.set(bookEntity);
    }

    return bookRef;
};

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
        // @ts-ignore
        translation: translationSnap.ref,
        original: {
            type: model.original.type,
            text: model.original.text,
            pageNumber: model.original.pageNumber,
            matches: originalMatches,
            // @ts-ignore
            source: originalBookRef,
        },
        translated: {
            type: model.translated.type,
            text: model.translated.text,
            pageNumber: model.translated.pageNumber,
            matches: translatedMatches,
            // @ts-ignore
            source: translatedBookRef,
        },
        commentCount: 0,
    };

    await translationExampleRef.set(translationExample);

    return { translationExampleId: translationExampleRef.id };
});
