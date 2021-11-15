import firebase from 'firebase/compat';
import { collections } from '../../hooks/data';
import { useCollection } from '../../hooks/fetch';
import { langA } from '../../languages';
import { DocReference, Term, Translation } from '../../types';
import { useLang } from '../../useLang';

export const useTerms = (termRefs: DocReference<Term>[]) =>
    useCollection(
        collections.terms.where(
            firebase.firestore.FieldPath.documentId(),
            'in',
            termRefs.map(ref => ref.id)
        )
    );

export const useTranslations = (translationRefs: DocReference<Translation>[]) =>
    useCollection(
        collections.translations.where(
            firebase.firestore.FieldPath.documentId(),
            'in',
            translationRefs.map(ref => ref.id)
        )
    );

export const getLongestEntity = <Entity extends Term | Translation>(terms: Entity[]): Entity | null =>
    terms.reduce((prev, current) => (prev.value.length > current.value.length ? prev : current));

export const useLangIdentifier = () => {
    const [lang] = useLang();
    return lang === langA ? 'langA' : 'langB';
};
