import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, NavLink } from 'react-router-dom';
import { ButtonLink } from '../Form/Button';
import { HorizontalRadio, HorizontalRadioContainer } from '../Form/HorizontalRadio';
import { useTerms } from '../hooks/data';
import { langA, langB } from '../languages';
import { LoginHint } from '../LoginHint';
import { Redact } from '../RedactSensitiveTerms';
import { TERM, TERM_ADD } from '../routes';
import { Lang } from '../types';
import { useLang } from '../useLang';
import s from './style.module.css';

type TermsProps = {
    classNames: {
        terms?: string;
        termsInner?: string;
        termsControl?: string;
        termsControlInner?: string;
    };
};

export function Terms({ classNames }: TermsProps) {
    const { t } = useTranslation();
    const terms = useTerms();
    const [langFilter, setLangFilter] = useState<Lang>();
    const [lang] = useLang();
    const sortedTerms = terms
        .filter(term => !langFilter || langFilter === term.lang)
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
        <>
            <div className={classNames?.termsControl}>
                <div className={classNames?.termsControlInner}>
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
                    <LoginHint i18nKey="term.registerToAdd">
                        <div className={s.addTermButtonContainer}>
                            <ButtonLink to={TERM_ADD}>{t('common.entities.term.add')}</ButtonLink>
                        </div>
                    </LoginHint>
                </div>
            </div>
        </>
    );
}
