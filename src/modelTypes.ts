import { SourceType } from './types';

interface BaseTranslationExampleModel<T extends SourceType, U extends BaseSnippetModel> {
    termId: string;
    translationId: string;
    type: T;
    original: U;
    translated: U;
}

interface BaseSnippetModel {
    text: string;
}

interface BookSnippetModel extends BaseSnippetModel {
    text: string;
    pageNumber?: string;
    bookId: string;
}

type BookTranslationExampleModel = BaseTranslationExampleModel<'BOOK', BookSnippetModel>;

export type TranslationExampleModel = BookTranslationExampleModel;
