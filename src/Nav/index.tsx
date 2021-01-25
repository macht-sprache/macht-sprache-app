import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTerms } from '../dataHooks';
import { HorizontalRadio, HorizontalRadioContainer } from '../Form/HorizontalRadio';
import s from './style.module.css';
import Logo from './logo.svg';
import { Lang } from '../types';
import { langA, langB } from '../languages';

export default function Nav() {
    return (
        <>
            <div className={s.header}>
                <Link className={s.logo} to="/">
                    <img src={Logo} alt="Logo of macht.sprache." />
                </Link>
            </div>
            <Terms />
        </>
    );
}

const langFilters: { value?: Lang; label: string; longLabel: string }[] = [
    {
        label: 'all',
        longLabel: 'show all terms',
    },
    {
        value: langB,
        label: langB.toUpperCase(),
        longLabel: 'show german terms only',
    },
    {
        value: langA,
        label: langA.toUpperCase(),
        longLabel: 'show english terms only',
    },
];

function Terms() {
    const [terms] = useTerms();
    const [langFilter, setLangFilter] = useState<Lang>();

    if (!terms) {
        return null;
    }

    return (
        <div className={s.nav}>
            <HorizontalRadioContainer>
                {langFilters.map(({ value, label, longLabel }) => (
                    <HorizontalRadio
                        key={value}
                        value={value ?? ''}
                        label={label}
                        name="language_nav_main"
                        checked={value === langFilter}
                        aria-label={longLabel}
                        onChange={() => {
                            setLangFilter(value);
                        }}
                        background={value || 'striped'}
                    />
                ))}
            </HorizontalRadioContainer>
            <ul className={s.terms}>
                {terms.map(term => {
                    if (langFilter && langFilter !== term.lang) {
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
