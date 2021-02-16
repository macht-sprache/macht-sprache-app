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
import { generatePath, Link } from 'react-router-dom';
import { TRANSLATION, TRANSLATION_ADD } from '../routes';

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

    return (
        <article className={s.item} lang={translation.lang}>
            <Link to={generatePath(TRANSLATION, { termId: term.id, translationId: translation.id })} className={s.link}>
                <header className={s.header}>
                    <h1 className={s.value}>{translation.value}</h1>
                </header>
                <div className={s.body}>
                    {!!sources.length && (
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
            </Link>
        </article>
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
