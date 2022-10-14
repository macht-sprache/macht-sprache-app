import { Suspense } from 'react';
import { useUser } from '../../hooks/appContext';
import { collections } from '../../hooks/data';
import { GetList, useCollection } from '../../hooks/fetch';
import { Term, TermRelation } from '../../types';
import { ModalDialog } from '../ModalDialog';
import { TermWithLang } from '../TermWithLang';
import firebase from 'firebase/compat/app';
import { useTranslation } from 'react-i18next';
import { SearchTerm } from '../EntitySearch';

type Props = {
    term: Term;
    onClose: () => void;
};

type InnerProps = Props & {
    getTermRelations: GetList<TermRelation>;
};

export default function RelatedTermsModal({ term, onClose }: Props) {
    const getTermRelations = useCollection(
        collections.termRelations.where('terms', 'array-contains', collections.terms.doc(term.id))
    );

    return (
        <Suspense fallback={null}>
            <ModalWrapper term={term} onClose={onClose} getTermRelations={getTermRelations} />
        </Suspense>
    );
}

function ModalWrapper({ term, onClose, getTermRelations }: InnerProps) {
    const { t } = useTranslation();
    const user = useUser()!;
    const termRelations = getTermRelations();
    const excludeFromSearch = [term.id, ...termRelations.flatMap(({ terms }) => terms).map(term => term.id)];

    const addRelatedTerm = (termId: string) => {
        const termIds = [term.id, termId].sort();
        const termRefs = termIds.map(id => collections.terms.doc(id));
        const id = termIds.join('-');
        const ref = collections.termRelations.doc(id);
        ref.set({
            id: '',
            terms: [termRefs[0], termRefs[1]],
            createdAt: firebase.firestore.Timestamp.now(),
            creator: {
                id: user.id,
                displayName: user.displayName,
            },
        });
    };

    return (
        <ModalDialog
            onClose={onClose}
            title={
                <>
                    Edit Related Terms for <TermWithLang term={term} />
                </>
            }
        >
            <ul>
                {termRelations.map(termRelation => (
                    <li key={termRelation.id}>{termRelation.id}</li>
                ))}
            </ul>

            <div>
                <SearchTerm
                    onSelect={term => {
                        addRelatedTerm(term.id);
                    }}
                    excludedTerms={excludeFromSearch}
                    label={t('term.search')}
                />
            </div>
        </ModalDialog>
    );
}
