import firebase from 'firebase/compat/app';
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

export const getLongestEntity = <Entity extends Term | Translation>(terms: Entity[]) =>
    terms.reduce<Entity | undefined>(
        (prev, current) => ((prev?.value?.length ?? 0) > current.value.length ? prev : current),
        undefined
    );

export const useLangIdentifier = () => {
    const [lang] = useLang();
    return lang === langA ? 'langA' : 'langB';
};

export const termOrTranslations = (terms: Term[], translations: Translation[]): 'term' | 'translation' => {
    const longestTerm = getLongestEntity(terms);
    const longestTranslation = getLongestEntity(translations);

    if (longestTerm && longestTranslation) {
        return longestTerm.value.length >= longestTranslation.value.length ? 'term' : 'translation';
    }

    if (longestTerm) return 'term';

    return 'translation';
};
