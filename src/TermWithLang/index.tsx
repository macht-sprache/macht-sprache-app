import { Term, Translation } from '../types';
import s from './style.module.css';

type TermWithLangProps = {
    term: Term | Translation;
};

export function TermWithLang({ term }: TermWithLangProps) {
    return (
        <span className={s.term} lang={term.lang}>
            {term.value}
        </span>
    );
}
