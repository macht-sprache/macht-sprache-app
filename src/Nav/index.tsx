import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, NavLink } from 'react-router-dom';
import { useTerms } from '../hooks/data';
import { HorizontalRadio, HorizontalRadioContainer } from '../Form/HorizontalRadio';
import { langA, langB } from '../languages';
import { LoginHint } from '../LoginHint';
import { TERM, TERM_ADD } from '../routes';
import { Lang } from '../types';
import s from './style.module.css';
import { useLang } from '../useLang';
import { ButtonLink } from '../Form/Button';

export default function Nav() {
    return <Terms />;
}

function Terms() {
    const { t } = useTranslation();
    const terms = useTerms();
    const [langFilter, setLangFilter] = useState<Lang>();
    const [lang] = useLang();
    const sortedTerms = terms
        .filter(term => (langFilter ? langFilter !== term.lang : true))
        .sort(({ value: valueA }, { value: valueB }) => valueA.localeCompare(valueB, lang));

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
                {sortedTerms.map(term => {
                    return (
                        <li key={term.id} className={s.term}>
                            <NavLink
                                to={generatePath(TERM, { termId: term.id })}
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
            <LoginHint i18nKey="term.registerToAdd">
                <div className={s.addTermButtonContainer}>
                    <ButtonLink to={TERM_ADD}>{t('common.entities.term.add')}</ButtonLink>
                </div>
            </LoginHint>
        </div>
    );
}
