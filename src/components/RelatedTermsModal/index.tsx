import { Suspense } from 'react';
import { useUser } from '../../hooks/appContext';
import { collections } from '../../hooks/data';
import { GetList, useCollection } from '../../hooks/fetch';
import { Term, TermRelation } from '../../types';
import { ModalDialog } from '../ModalDialog';
import { TermWithLang } from '../TermWithLang';
import firebase from 'firebase/compat/app';
import { Trans, useTranslation } from 'react-i18next';
import { SearchTerm } from '../EntitySearch';
import Button from '../Form/Button';
import s from './style.module.css';

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
    const getTerms = useCollection(collections.terms.where('adminTags.hideFromList', '==', false));
    const terms = getTerms().reduce<{ [key: string]: Term }>((terms, term) => ({ ...terms, [term.id]: term }), {});
    const termRelations = getTermRelations();
    const excludeFromSearch = Array.from(
        new Set([term.id, ...termRelations.flatMap(({ terms }) => terms).map(term => term.id)])
    );

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
                    <Trans
                        t={t}
                        i18nKey="common.entities.termRelation.editFor"
                        components={{ Term: <TermWithLang term={term} /> }}
                    />
                </>
            }
            isDismissable
        >
            {!!termRelations.length && (
                <ul className={s.relations}>
                    {termRelations.map(termRelation => (
                        <li key={termRelation.id} className={s.relation}>
                            <TermWithLang
                                term={
                                    terms[
                                        getOtherTerm(
                                            termRelation.terms.map(({ id }) => id),
                                            term.id
                                        )
                                    ]
                                }
                            />
                            <Button
                                onClick={() => {
                                    collections.termRelations.doc(termRelation.id).delete();
                                }}
                                size="small"
                            >
                                {t('common.formNav.delete')}
                            </Button>
                        </li>
                    ))}
                </ul>
            )}

            {!termRelations.length && <div className={s.noContent}>{t('term.noRelatedTermOveray')}</div>}

            <div>
                <SearchTerm
                    onSelect={term => {
                        addRelatedTerm(term.id);
                    }}
                    excludedTerms={excludeFromSearch}
                    label={t('common.entities.termRelation.add')}
                />
            </div>
        </ModalDialog>
    );
}

function getOtherTerm(termIds: string[], termId: string) {
    return termIds.filter(id => id !== termId)[0];
}
