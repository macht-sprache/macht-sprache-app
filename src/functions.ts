import { functions } from './firebase';
import { TranslationExampleModel } from './modelTypes';
import { Book, Lang } from './types';

const _findBooks = functions.httpsCallable('handlers-findBooks');

export const findBooks = (query: string, lang: Lang): Promise<{ data: Book[] }> => _findBooks({ query, lang });

const _addTranslationExample = functions.httpsCallable('handlers-addTranslationExample');

export const addTranslationExample = (
    model: TranslationExampleModel
): Promise<{ data: { translationExampleId: string } }> => _addTranslationExample(model);
