import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { db } from './firebase';
import { Term, Translation, TranslationExample } from './types';

const defaultOptions = { idField: 'id' };

export function useTerms() {
    return useCollectionData<Term>(db.collection('terms'), defaultOptions);
}

export function useTerm(id: string) {
    return useDocumentData<Term>(db.doc(`/terms/${id}`), defaultOptions);
}

export function useTranslations(termId: string) {
    return useCollectionData<Translation>(db.collection(`/terms/${termId}/translations`), defaultOptions);
}

export function useTranslationExamples(termId: string, translationId: string) {
    return useCollectionData<TranslationExample>(
        db.collection(`/terms/${termId}/translations/${translationId}/translationExamples`),
        defaultOptions
    );
}
