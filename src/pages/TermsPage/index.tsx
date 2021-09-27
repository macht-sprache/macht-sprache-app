import { useTranslation } from 'react-i18next';
import { SimpleHeader } from '../../components/Header';
import { collections } from '../../hooks/data';
import { useCollection } from '../../hooks/fetch';
import { FullWidthColumn } from '../../components/Layout/Columns';
import { TermsBig } from '../../components/Terms/TermsBig';

export function TermsPage() {
    const { t } = useTranslation();
    const getTerms = useCollection(collections.terms.where('adminTags.hideFromList', '==', false));

    return (
        <>
            <SimpleHeader>{t('common.entities.term.value_plural')}</SimpleHeader>

            <FullWidthColumn>
                <TermsBig getTerms={getTerms} />
            </FullWidthColumn>
        </>
    );
}
