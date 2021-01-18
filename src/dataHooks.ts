import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { db } from './firebase';
import { Term } from './types/Term';

export function useTerms() {
    return useCollectionData<Term>(db.collection('terms'), { idField: 'id' });
}

export function useTerm(id: string) {
    return useDocumentData<Term>(db.doc(`/terms/${id}`), { idField: 'id' });
}
