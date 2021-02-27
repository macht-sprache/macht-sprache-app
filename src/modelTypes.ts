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
    sourceId: string;
}

interface BookSnippetModel extends BaseSnippetModel {
    pageNumber?: string;
}

type BookTranslationExampleModel = BaseTranslationExampleModel<'BOOK', BookSnippetModel>;
type MovieTranslationExampleModel = BaseTranslationExampleModel<'MOVIE', BaseSnippetModel>;
type WebPageTranslationExampleModel = BaseTranslationExampleModel<'WEBPAGE', BaseSnippetModel>;

export type TranslationExampleModel =
    | BookTranslationExampleModel
    | MovieTranslationExampleModel
    | WebPageTranslationExampleModel;
