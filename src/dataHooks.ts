import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { db } from './firebase';
import { Term, Translation, TranslationExample } from './types';

const defaultOptions = { idField: 'id' };

export const collections = {
    terms: db.collection('terms'),
    translations: db.collection('translations'),
    translationExamples: db.collection('translationExamples'),
    comments: db.collection('comments'),
};

export function useTerms() {
    return useCollectionData<Term>(collections.terms, defaultOptions);
}

export function useTerm(id: string) {
    return useDocumentData<Term>(collections.terms.doc(id), defaultOptions);
}

export function useTranslations(termId: string) {
    return useCollectionData<Translation>(
        collections.translations.where('term', '==', collections.terms.doc(termId)),
        defaultOptions
    );
}

export function useTranslationExamples(translationId: string) {
    return useCollectionData<TranslationExample>(
        collections.translationExamples.where(
            'translations',
            'array-contains',
            collections.translations.doc(translationId)
        ),
        defaultOptions
    );
}
