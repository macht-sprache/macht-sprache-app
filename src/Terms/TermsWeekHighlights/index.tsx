import { collections } from '../../hooks/data';
import { useCollection } from '../../hooks/fetch';
import { TermItem } from '../TermItem';

export function TermsWeekHighlights() {
    const getTerms = useCollection(collections.terms.where('weekHighlight', '==', true));
    const highlightedTerms = [...getTerms()].sort((termA, termB) => termA.value.localeCompare(termB.value, termA.lang));

    return (
        <>
            {highlightedTerms.map(term => (
                <TermItem key={term.id} term={term} />
            ))}
        </>
    );
}
