import { functions } from './firebase';
import { TranslationExampleModel } from './modelTypes';
import { Book, Lang, Movie } from './types';

const _findBooks = functions.httpsCallable('handlers-findBooks');

export const findBooks = (query: string, lang: Lang): Promise<Book[]> =>
    _findBooks({ query, lang }).then(({ data }) => data);

const _findMovies = functions.httpsCallable('handlers-findMovies');

export const findMovies = (query: string, lang: Lang): Promise<Movie[]> =>
    _findMovies({ query, lang }).then(({ data }) => data);

const _addTranslationExample = functions.httpsCallable('handlers-addTranslationExample');

export const addTranslationExample = (
    model: TranslationExampleModel
): Promise<{ data: { translationExampleId: string } }> => _addTranslationExample(model);
