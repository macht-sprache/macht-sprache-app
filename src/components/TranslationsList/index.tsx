import clsx from 'clsx';
import { Trans, useTranslation } from 'react-i18next';
import { generatePath, Link, useHistory } from 'react-router-dom';
import { useGroupedSources } from '../../hooks/data';
import { GetList } from '../../hooks/fetch';
import { langA, langB } from '../../languages';
import { TRANSLATION, TRANSLATION_ADD, TRANSLATION_EXAMPLE_ADD } from '../../routes';
import { Source, Term, Translation } from '../../types';
import { getDominantLanguageClass } from '../../useLangCssVars';
import { stopPropagation } from '../../utils';
import { AddEntityButton } from '../AddEntityButton';
import { CoverIcon } from '../CoverIcon';
import { FormatDate } from '../FormatDate';
import { RatingContainer } from '../Rating';
import { Redact } from '../RedactSensitiveTerms';
import { TermWithLang } from '../TermWithLang';
import { UserInlineDisplay } from '../UserInlineDisplay';
import { sortTranslations } from './service';
import s from './style.module.css';

type TranslationsListProps = {
    term: Term;
    getTranslations: GetList<Translation>;
    // TODO: This is not actually needed on the small size – we should split this component up
    getSources: GetList<Source>;
    size?: 'small' | 'medium';
    itemsClickable?: boolean;
};

export function TranslationsList({
    term,
    getTranslations,
    getSources,
    size = 'medium',
    itemsClickable = true,
}: TranslationsListProps) {
    const translations = getTranslations();
    const { t } = useTranslation();
    const translationsCount = translations.length;
    const sources = useGroupedSources(getSources());
    const otherLang = term.lang === langA ? langB : langA;
    const translationsSorted = sortTranslations(translations);

    return (
        <div className={clsx(s.container, s[size])}>
            {size === 'medium' && (
                <h2>
                    {translationsCount}{' '}
                    {t(
                        term.adminTags.translationsAsVariants
                            ? 'term.variants.variant'
                            : 'common.entities.translation.value',
                        {
                            count: translationsCount,
                        }
                    )}
                </h2>
            )}
            {!translations.length && (
                <p>
                    <Trans
                        t={t}
                        i18nKey={size === 'small' ? 'translation.emptyShort' : 'translation.empty'}
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
                        clickable={itemsClickable}
                    />
                ))}
                {size === 'medium' && (
                    <AddEntityButton to={generatePath(TRANSLATION_ADD, { termId: term.id })}>
                        <Trans
                            i18nKey={
                                term.adminTags.translationsAsVariants
                                    ? 'term.variants.addVariant'
                                    : (`term.addTranslation.${otherLang}` as const)
                            }
                            t={t}
                            components={{ Term: <TermWithLang term={term} /> }}
                        />
                    </AddEntityButton>
                )}
            </div>
        </div>
    );
}

export function TranslationItem({
    translation,
    term,
    size = 'small',
    sources = [],
    showMeta = false,
    clickable = true,
}: {
    translation: Translation;
    term: Term;
    size?: 'small' | 'medium';
    sources?: Source[];
    showMeta?: boolean;
    clickable?: boolean;
}) {
    const { t } = useTranslation();
    const history = useHistory();
    const link = generatePath(TRANSLATION, { termId: term.id, translationId: translation.id });
    const addExampleLink = generatePath(TRANSLATION_EXAMPLE_ADD, { termId: term.id, translationId: translation.id });

    const Heading = () => (
        <h1 className={s.value}>
            <Redact>{translation.value}</Redact>
        </h1>
    );

    return (
        <article
            className={clsx(getDominantLanguageClass(translation.lang), s.item)}
            onClick={e => {
                if (clickable) {
                    history.push(link);
                    e.stopPropagation();
                }
            }}
        >
            {showMeta && (
                <div className={s.itemMeta}>
                    <Redact>{term.value}</Redact>:{' '}
                    <Trans
                        t={t}
                        i18nKey="common.addedOn"
                        components={{
                            User: <UserInlineDisplay {...term.creator} />,
                            FormatDate: <FormatDate date={term.createdAt.toDate()} />,
                        }}
                    />
                </div>
            )}
            <div className={clsx(s.itemInner, { [s.clickable]: clickable })}>
                <header className={s.header}>
                    {clickable ? (
                        <Link to={link} onClick={stopPropagation} className={s.link} lang={translation.lang}>
                            <Heading />
                        </Link>
                    ) : (
                        <Heading />
                    )}
                    <div className={s.rating}>
                        <RatingContainer term={term} translation={translation} size="small" />
                    </div>
                </header>
                {size === 'medium' && (
                    <div className={s.body}>
                        {!term.adminTags.translationsAsVariants && (
                            <>
                                {!sources.length ? (
                                    <div className={s.noExample}>
                                        <AddExampleButton to={addExampleLink} className={s.noExampleButton} />
                                        <span className={s.noExampleText}>
                                            <Trans
                                                t={t}
                                                i18nKey={'translationExample.translationListNoExample'}
                                                components={{
                                                    Link: <Link onClick={stopPropagation} to={addExampleLink} />,
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
                            </>
                        )}
                        <footer className={s.footer}>
                            {term.adminTags.enableCommentsOnTranslations && (
                                <div className={s.comments}>
                                    {t('common.entities.comment.withCount', { count: translation.commentCount })}
                                </div>
                            )}

                            <div className={s.date}>
                                <FormatDate date={translation.createdAt} />
                            </div>
                        </footer>
                    </div>
                )}
            </div>
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
