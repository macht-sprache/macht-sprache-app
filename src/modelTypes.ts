type BookSnippetModel = {
    type: 'BOOK';
    text: string;
    pageNumber?: string;
    bookId: string;
};

type SnippetModel = BookSnippetModel;

export type TranslationExampleModel = {
    termId: string;
    translationId: string;
    original: SnippetModel;
    translated: SnippetModel;
};
