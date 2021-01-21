import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTerms } from '../dataHooks';
import { HorizontalRadio, HorizontalRadioContainer } from '../Form/HorizontalRadio';
import s from './style.module.css';

export default function Nav() {
    return (
        <>
            <div className={s.header}>
                <Link className={s.logo} to="/">
                    macht.sprache.
                </Link>
            </div>
            <Terms />
        </>
    );
}

function Terms() {
    const [terms] = useTerms();
    const [langFilter, setLangFilter] = useState('');

    const langFilters = [
        {
            value: '',
            label: 'all',
            longLabel: 'show all terms',
            background: 'striped' as const,
        },
        {
            value: 'de',
            label: 'DE',
            longLabel: 'show german terms only',
            background: 'de' as const,
        },
        {
            value: 'en',
            label: 'EN',
            longLabel: 'show english terms only',
            background: 'en' as const,
        },
    ];

    if (!terms) {
        return null;
    }

    return (
        <div className={s.nav}>
            <HorizontalRadioContainer>
                {langFilters.map(({ value, label, longLabel, background }) => (
                    <HorizontalRadio
                        key={value}
                        value={value}
                        label={label}
                        name="language_nav_main"
                        checked={value === langFilter}
                        aria-label={longLabel}
                        onChange={() => {
                            setLangFilter(value);
                        }}
                        background={background}
                    />
                ))}
            </HorizontalRadioContainer>
            <ul className={s.terms}>
                {terms.map(term => {
                    if (langFilter !== '' && langFilter !== term.lang) {
                        return null;
                    }

                    return (
                        <li key={term.id} className={s.term}>
                            <NavLink
                                to={`/term/${term.id}`}
                                className={s.termLink}
                                activeClassName={s.termLinkActive}
                                lang={term.lang}
                            >
                                {term.value}
                            </NavLink>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
