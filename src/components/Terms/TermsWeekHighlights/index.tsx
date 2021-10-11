import { useTranslation } from 'react-i18next';
import { collections } from '../../../hooks/data';
import { useCollection } from '../../../hooks/fetch';
import { ColumnHeading, Columns } from '../../Layout/Columns';
import { TermItem } from '../TermItem';

export function TermsWeekHighlights() {
    const { t } = useTranslation();
    const getTerms = useCollection(collections.terms.where('adminTags.hightlightLandingPage', '==', true));
    const highlightedTerms = [...getTerms()].sort((termA, termB) => termA.value.localeCompare(termB.value, termA.lang));

    if (highlightedTerms.length === 0) {
        return null;
    }

    return (
        <>
            <ColumnHeading>{t('home.termsOfTheWeek')}</ColumnHeading>
            <Columns>
                {highlightedTerms.map(term => (
                    <TermItem key={term.id} term={term} />
                ))}
            </Columns>
        </>
    );
}
