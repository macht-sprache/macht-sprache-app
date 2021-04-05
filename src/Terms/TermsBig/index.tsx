import { useState } from 'react';
import { GetList } from '../../hooks/fetch';
import { Lang, Term } from '../../types';
import { useLang } from '../../useLang';
import { LangFilter } from '../LangFilter';
import { TermItem } from '../TermItem';
import s from './style.module.css';

type Props = {
    getTerms: GetList<Term>;
};

export function TermsBig({ getTerms }: Props) {
    const [langFilter, setLangFilter] = useState<Lang>();
    const [lang] = useLang();

    const terms = getTerms();
    const sortedTerms = terms
        .filter(term => !langFilter || langFilter === term.lang)
        .sort(({ value: valueA }, { value: valueB }) => valueA.localeCompare(valueB, lang));

    return (
        <>
            <LangFilter langFilter={langFilter} setLangFilter={setLangFilter} />
            <div className={s.terms}>
                {sortedTerms.map(term => (
                    <TermItem key={term.id} term={term} size="small" />
                ))}
            </div>
        </>
    );
}
