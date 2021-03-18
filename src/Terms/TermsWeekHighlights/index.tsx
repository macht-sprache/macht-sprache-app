import { useTerms } from '../../hooks/data';
import { TermItem } from '../TermItem';
import s from './style.module.css';

export function TermsWeekHighlights() {
    const terms = useTerms();

    const highlightedTerms = terms
        .filter(term => term.weekHighlight)
        .sort((termA, termB) => termA.value.localeCompare(termB.value, termA.lang));

    return (
        <div className={s.container}>
            {highlightedTerms.map(term => (
                <TermItem key={term.id} term={term} />
            ))}
        </div>
    );
}
