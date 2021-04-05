import { useState } from 'react';
import { generatePath, NavLink } from 'react-router-dom';
import { GetList } from '../../hooks/fetch';
import { Redact } from '../../RedactSensitiveTerms';
import { TERM } from '../../routes';
import { Lang, Term } from '../../types';
import { useLang } from '../../useLang';
import { LangFilter } from '../LangFilter';
import s from './style.module.css';

type TermsProps = {
    getTerms: GetList<Term>;
    classNames?: {
        terms?: string;
        termsInner?: string;
        termsControl?: string;
        termsControlInner?: string;
    };
};

export function Terms({ classNames, getTerms }: TermsProps) {
    const [langFilter, setLangFilter] = useState<Lang>();
    const [lang] = useLang();

    const terms = getTerms();
    const sortedTerms = terms
        .filter(term => !langFilter || langFilter === term.lang)
        .sort(({ value: valueA }, { value: valueB }) => valueA.localeCompare(valueB, lang));

    return (
        <>
            <div className={classNames?.termsControl}>
                <div className={classNames?.termsControlInner}>
                    <LangFilter langFilter={langFilter} setLangFilter={setLangFilter} />
                </div>
            </div>
            <div className={classNames?.terms}>
                <div className={classNames?.termsInner}>
                    <ul className={s.terms}>
                        {sortedTerms.map(term => {
                            return (
                                <li key={term.id} className={s.term}>
                                    <NavLink
                                        to={generatePath(TERM, { termId: term.id })}
                                        className={s.termLink}
                                        activeClassName={s.termLinkActive}
                                        lang={term.lang}
                                    >
                                        <Redact>{term.value}</Redact>
                                    </NavLink>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </>
    );
}
