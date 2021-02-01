import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink } from 'react-router-dom';
import { useUser } from '../authHooks';
import { useTerms } from '../dataHooks';
import { HorizontalRadio, HorizontalRadioContainer } from '../Form/HorizontalRadio';
import { langA, langB } from '../languages';
import { TERM_ADD } from '../routes';
import { Lang } from '../types';
import s from './style.module.css';

export default function Nav() {
    return <Terms />;
}

function Terms() {
    const { t } = useTranslation();
    const user = useUser();
    const [terms] = useTerms();
    const [langFilter, setLangFilter] = useState<Lang>();

    if (!terms) {
        return null;
    }

    const langFilters: { value?: Lang; label: string; longLabel: string }[] = [
        {
            label: t('nav.filter.all.label'),
            longLabel: t('nav.filter.all.longLabel'),
        },
        {
            value: langB,
            label: langB.toUpperCase(),
            longLabel: t(`nav.filter.${langB}.longLabel` as const),
        },
        {
            value: langA,
            label: langA.toUpperCase(),
            longLabel: t(`nav.filter.${langA}.longLabel` as const),
        },
    ];

    return (
        <div className={s.nav}>
            <HorizontalRadioContainer>
                {langFilters.map(({ value, label, longLabel }) => (
                    <HorizontalRadio
                        key={value ?? ''}
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
            {user && <Link to={TERM_ADD}>{t('common.entities.term.add')}</Link>}
        </div>
    );
}
