import { firestore } from 'firebase-admin';
import { books_v1, google } from 'googleapis';
import { isValid, take } from 'rambdax';
import { langA, langB } from '../../../src/languages';
import { Book, BookSource, Lang } from '../../../src/types';
import { convertRef, db, WithoutId } from '../firebase';

const booksApi = google.books('v1');

const sourceIdPrefix = 'gbooks:';

const makeSourceId = (volumeId: string) => sourceIdPrefix + volumeId;
const makeVolumeId = (sourceId: string) => sourceId.replace(sourceIdPrefix, '');

const BookSchema = {
    id: String,
    lang: String,
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
        id: id ? makeSourceId(id) : undefined,
        lang: ([langA, langB] as const).find(lang => lang === volumeInfo?.language),
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
    const cover = imageLinks?.thumbnail || imageLinks?.smallThumbnail;
    return cover?.replace('http://', 'https://');
};

export const searchBooks = async (query: string, lang: Lang) => {
    const { data } = await booksApi.volumes.list({
        langRestrict: lang,
        q: query,
        printType: 'books',
        maxResults: 20,
        orderBy: 'relevance',
    });
    const volumes = data.items || [];
    const books = take(10, volumes.map(volumeToBook).filter(isValidBook));
    return books;
};

const getBook = async (sourceId: string) => {
    const { data } = await booksApi.volumes.get({ volumeId: makeVolumeId(sourceId) });
    const maybeBook = volumeToBook(data);

    if (isValidBook(maybeBook)) {
        return maybeBook;
    }

    throw new Error(`Book ${sourceId} not found.`);
};

export const ensureBookRef = async (
    bookId: string,
    termRef: firestore.DocumentReference,
    translationRef: firestore.DocumentReference
) => {
    const bookRef = db.collection('sources').doc(bookId);
    const bookSource = (await bookRef.get()).data() as WithoutId<BookSource> | undefined;

    if (!bookSource) {
        const { id, ...bookEntity } = await getBook(bookId);
        const newBookSource: WithoutId<BookSource> = {
            ...bookEntity,
            type: 'BOOK',
            refs: [convertRef(termRef), convertRef(translationRef)],
        };
        await bookRef.set(newBookSource);
    } else {
        const update: Partial<WithoutId<BookSource>> = {
            refs: [...bookSource.refs, convertRef(termRef), convertRef(translationRef)],
        };
        await bookRef.update(update);
    }

    return bookRef;
};
