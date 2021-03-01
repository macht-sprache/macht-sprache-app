import { SourceType } from './types';

export type TranslationExampleModel = {
    termId: string;
    translationId: string;
    type: SourceType;
    original: SnippetModel;
    translated: SnippetModel;
};

type SnippetModel = {
    text: string;
    sourceId: string;
    pageNumber?: string;
};
