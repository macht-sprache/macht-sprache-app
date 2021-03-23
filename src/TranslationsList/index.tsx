import clsx from 'clsx';
import deburr from 'lodash.deburr';
import orderBy from 'lodash.orderby';
import { Trans, useTranslation } from 'react-i18next';
import { generatePath, Link, useHistory } from 'react-router-dom';
import { AddEntityButton } from '../AddEntityButton';
import { CoverIcon } from '../CoverIcon';
import { FormatDate } from '../FormatDate';
import { collections, useSources, useTranslations } from '../hooks/data';
import { langA, langB } from '../languages';
import { RatingWidgetContainer } from '../Rating/RatingWidget';
import { Redact } from '../RedactSensitiveTerms';
import { TRANSLATION, TRANSLATION_ADD, TRANSLATION_EXAMPLE_ADD } from '../routes';
import { TermWithLang } from '../TermWithLang';
import { Source, Term, Translation } from '../types';
import { getDominantLanguageClass } from '../useLangCssVars';
import { stopPropagation } from '../utils';
import s from './style.module.css';

type TranslationsListProps = { term: Term; size?: 'small' | 'medium' };

export function TranslationsList({ term, size = 'medium' }: TranslationsListProps) {
    const translations = useTranslations(term.id);
    const { t } = useTranslation();
    const commentCount = translations.length;
    const sources = useSources(collections.terms.doc(term.id));
    const otherLang = term.lang === langA ? langB : langA;
    const translationsSorted = orderBy(
        translations,
        [({ ratings }) => averageRatings(ratings), ({ value }) => deburr(value)],
        ['desc', 'asc']
    );

    return (
        <div className={clsx(s.container, s[size])}>
            {size === 'medium' && (
                <h2>
                    {commentCount} {t('common.entities.translation.value', { count: commentCount })}
                </h2>
            )}
            {!translations.length && (
                <p>
                    <Trans
                        t={t}
                        i18nKey="translation.empty"
                        values={{ term: term.value }}
                        components={{ TermWithLang: <TermWithLang term={term} /> }}
                    />
                </p>
            )}
            <div className={s.list}>
                {translationsSorted.map(translation => (
                    <TranslationItem
                        key={translation.id}
                        term={term}
                        translation={translation}
                        sources={sources[translation.id]}
                        size={size}
                    />
                ))}
                {size === 'medium' && (
                    <AddEntityButton to={generatePath(TRANSLATION_ADD, { termId: term.id })}>
                        <Trans
                            i18nKey={`term.addTranslation.${otherLang}` as const}
                            t={t}
                            components={{ Term: <TermWithLang term={term} /> }}
                        />
                    </AddEntityButton>
                )}
            </div>
        </div>
    );
}

function TranslationItem({
    translation,
    term,
    size,
    sources = [],
}: {
    translation: Translation;
    term: Term;
    size: 'small' | 'medium';
    sources: Source[];
}) {
    const { t } = useTranslation();
    const history = useHistory();
    const link = generatePath(TRANSLATION, { termId: term.id, translationId: translation.id });
    const addExampleLink = generatePath(TRANSLATION_EXAMPLE_ADD, { termId: term.id, translationId: translation.id });

    return (
        <article
            className={clsx(getDominantLanguageClass(translation.lang), s.item)}
            onClick={() => history.push(link)}
        >
            <header className={s.header}>
                <Link to={link} onClick={stopPropagation} className={s.link} lang={translation.lang}>
                    <h1 className={s.value}>
                        <Redact>{translation.value}</Redact>
                    </h1>
                </Link>
                <div className={s.rating}>
                    <RatingWidgetContainer term={term} translation={translation} size="small" />
                </div>
            </header>
            {size === 'medium' && (
                <div className={s.body}>
                    {!sources.length ? (
                        <div className={s.noExample}>
                            <AddExampleButton to={addExampleLink} className={s.noExampleButton} />
                            <span className={s.noExampleText}>
                                <Trans
                                    t={t}
                                    i18nKey={'translationExample.translationListNoExample'}
                                    components={{
                                        Link: (
                                            <Link
                                                onClick={e => {
                                                    e.stopPropagation();
                                                }}
                                                to={addExampleLink}
                                            />
                                        ),
                                    }}
                                />
                            </span>
                        </div>
                    ) : (
                        <ul className={s.translationExampleList}>
                            <li className={s.translationExampleListItem}>
                                <AddExampleButton to={addExampleLink} />
                            </li>
                            {sources
                                .filter(source => source.lang === term.lang)
                                .map(source => (
                                    <li key={source.id} className={s.translationExampleListItem}>
                                        <CoverIcon className={s.exampleIcon} item={source} />
                                    </li>
                                ))}
                        </ul>
                    )}
                    <footer className={s.footer}>
                        <div className={s.comments}>
                            {t('common.entities.comment.withCount', { count: translation.commentCount })}
                        </div>

                        <div className={s.date}>
                            <FormatDate date={translation.createdAt} />
                        </div>
                    </footer>
                </div>
            )}
        </article>
    );
}

function AddExampleButton({ to, className }: { to: string; className?: string }) {
    const { t } = useTranslation();

    return (
        <Link
            to={to}
            className={clsx(s.addExampleButton, className)}
            onClick={stopPropagation}
            aria-label={t('common.entities.translatioExample.add')}
            title={t('common.entities.translatioExample.add')}
        >
            +
        </Link>
    );
}

function averageRatings(ratings: number[] = []) {
    const sumOfAllRatings = ratings.reduce((accumulator, current, index) => {
        return accumulator + current * (index + 1);
    }, 0);
    const countOfAllRatings = ratings.reduce((a, b) => a + b, 0);

    return countOfAllRatings && sumOfAllRatings / countOfAllRatings;
}
