import { useState } from 'react';
import { generatePath, NavLink } from 'react-router-dom';
import { useTerms, useTranslations } from '../../hooks/data';
import { Redact } from '../../RedactSensitiveTerms';
import { TERM } from '../../routes';
import { TermWithLang } from '../../TermWithLang';
import { Lang, Term } from '../../types';
import { useLang } from '../../useLang';
import { LangFilter } from '../LangFilter';
import s from './style.module.css';

export function TermsBig() {
    const terms = useTerms();
    const [langFilter, setLangFilter] = useState<Lang>();
    const [lang] = useLang();
    const sortedTerms = terms
        .filter(term => !langFilter || langFilter === term.lang)
        .sort(({ value: valueA }, { value: valueB }) => valueA.localeCompare(valueB, lang));

    return (
        <>
            <LangFilter langFilter={langFilter} setLangFilter={setLangFilter} />
            <ul className={s.terms}>
                {sortedTerms.map(term => (
                    <TermItem key={term.id} term={term} />
                ))}
            </ul>
        </>
    );
}

function TermItem({ term }: { term: Term }) {
    const translations = useTranslations(term.id);

    return (
        <li className={s.term}>
            <NavLink
                to={generatePath(TERM, { termId: term.id })}
                className={s.termLink}
                activeClassName={s.termLinkActive}
                lang={term.lang}
            >
                <div className={s.termValue}>
                    <Redact>{term.value}</Redact>
                </div>
                <ul className={s.translations}>
                    {translations.map(term => (
                        <li key={term.id} className={s.translation}>
                            <TermWithLang term={term} />
                        </li>
                    ))}
                </ul>
            </NavLink>
        </li>
    );
}
