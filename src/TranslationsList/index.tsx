import s from './style.module.css';
import { collections, useSources, useTranslations } from '../hooks/data';
import { Trans, useTranslation } from 'react-i18next';
import { TermWithLang } from '../TermWithLang';
import { Source, Term, Translation } from '../types';
import { ButtonContainer, ButtonLink } from '../Form/Button';
import { ColumnHeading } from '../Layout/Columns';
import { LoginHint } from '../LoginHint';
import { FormatDate } from '../FormatDate';
import { useLang } from '../useLang';
import { generatePath, Link, useHistory } from 'react-router-dom';
import { TRANSLATION, TRANSLATION_ADD, TRANSLATION_EXAMPLE_ADD } from '../routes';
import clsx from 'clsx';
import { RatingWidgetContainer } from '../Rating/RatingWidget';

export function TranslationsList({ term }: { term: Term }) {
    const translations = useTranslations(term.id);
    const { t } = useTranslation();
    const commentCount = translations.length;
    const sources = useSources(collections.terms.doc(term.id));

    return (
        <div>
            <ColumnHeading>
                {commentCount} {t('common.entities.translation.value', { count: commentCount })}
            </ColumnHeading>
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
            {!!translations.length && (
                <div className={s.list}>
                    {translations.map(translation => (
                        <TranslationItem
                            key={translation.id}
                            term={term}
                            translation={translation}
                            sources={sources[translation.id]}
                        />
                    ))}
                </div>
            )}
            <AddTranslationButton termId={term.id} />
        </div>
    );
}

function TranslationItem({
    translation,
    term,
    sources = [],
}: {
    translation: Translation;
    term: Term;
    sources: Source[];
}) {
    const [lang] = useLang();
    const { t } = useTranslation();
    const history = useHistory();
    const link = generatePath(TRANSLATION, { termId: term.id, translationId: translation.id });
    const addExampleLink = generatePath(TRANSLATION_EXAMPLE_ADD, { termId: term.id, translationId: translation.id });

    return (
        <article
            className={s.item}
            lang={translation.lang}
            onClick={() => {
                history.push(link);
            }}
        >
            <header className={s.header}>
                <Link
                    to={link}
                    onClick={e => {
                        e.stopPropagation();
                    }}
                    className={s.link}
                >
                    <h1 className={s.value}>{translation.value}</h1>
                </Link>
                <div className={s.rating}>
                    <RatingWidgetContainer term={term} translation={translation} size="small" />
                </div>
            </header>
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
                                values={{ term: term.value }}
                            />
                        </span>
                    </div>
                ) : (
                    <ul className={s.translationExampleList}>
                        {sources.map(example => {
                            if (example.type === 'BOOK') {
                                return (
                                    <li key={example.id} className={s.translationExampleListItem}>
                                        {example.coverUrl ? (
                                            <img
                                                src={example.coverUrl}
                                                alt={example.title}
                                                title={example.title}
                                                className={s.translationExampleListImage}
                                            />
                                        ) : (
                                            example.title
                                        )}
                                    </li>
                                );
                            }

                            return null;
                        })}
                        <li className={s.translationExampleListItem}>
                            <AddExampleButton to={addExampleLink} />
                        </li>
                    </ul>
                )}
                <footer className={s.footer} lang={lang}>
                    <div className={s.comments}>
                        {t('common.entities.comment.withCount', { count: translation.commentCount })}
                    </div>

                    <div className={s.date}>
                        <FormatDate date={translation.createdAt.toDate()} />
                    </div>
                </footer>
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
            onClick={e => {
                e.stopPropagation();
            }}
            aria-label={t('common.entities.translatioExample.add')}
            title={t('common.entities.translatioExample.add')}
        >
            +
        </Link>
    );
}

function AddTranslationButton({ termId }: { termId: string }) {
    const { t } = useTranslation();

    return (
        <div className={s.addTranslationButtonContainer}>
            <LoginHint i18nKey="translation.registerToAdd">
                <ButtonContainer align="left">
                    <ButtonLink to={generatePath(TRANSLATION_ADD, { termId: termId })}>
                        {t('common.entities.translation.add')}
                    </ButtonLink>
                </ButtonContainer>
            </LoginHint>
        </div>
    );
}
