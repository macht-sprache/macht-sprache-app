import { LanguageServiceClient } from '@google-cloud/language';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import { books_v1, google } from 'googleapis';
import { all, isNil, isValid, last, partition, slice, zip } from 'rambdax';
import { Book, Lang } from '../../../src/types';
import { functions } from '../firebase';

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
    publisher: String,
    isbn: String,
    'coverUrl?': String,
};

const isValidBook = (book: object): book is Book => isValid({ input: book, schema: BookSchema });
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

    const { data } = await booksApi.volumes.list({ langRestrict: lang, q: 'intitle:' + query, maxResults: 20 });
    const volumes = data.items || [];
    const books = volumes
        .map(
            ({ id, volumeInfo }): Partial<Book> => ({
                id: id ?? undefined,
                title: volumeInfo?.title,
                authors: volumeInfo?.authors,
                publisher: volumeInfo?.publisher,
                isbn: volumeInfo?.industryIdentifiers?.find(identifier => identifier.type?.startsWith('ISBN'))
                    ?.identifier,
                coverUrl: getCover(volumeInfo),
            })
        )
        .filter(isValidBook);
    return books;
});

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

export const addTranslationExample = functions.https.onCall(async (data, context) => {
    verifyUser(context);
});
