import clsx from 'clsx';
import { Suspense } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { generatePath } from 'react-router';
import { collections, getCommentsRef, getTranslationsRef } from '../../../hooks/data';
import { GetList, useCollection } from '../../../hooks/fetch';
import { useSafeNavigate } from '../../../hooks/location';
import { langA } from '../../../languages';
import { TERM } from '../../../routes';
import { Comment, Term } from '../../../types';
import { useLang } from '../../../useLang';
import { getDominantLanguageClass } from '../../../useLangCssVars';
import { stopPropagation } from '../../../utils';
import { CommentItem } from '../../Comments/CommentItem';
import { FormatDate } from '../../FormatDate';
import Link from '../../Link';
import { Redact } from '../../RedactSensitiveTerms';
import { TermWithLang } from '../../TermWithLang';
import { TranslationsList } from '../../TranslationsList';
import { UserInlineDisplay } from '../../UserInlineDisplay';
import s from './style.module.css';

const EMPTY_ARRAY: never[] = [];

type TermItemProps = { term: Term; size?: 'small' | 'medium' | 'tiny'; showMeta?: boolean };

export function TermItem({ term, size = 'medium', showMeta = false }: TermItemProps) {
    const termRef = collections.terms.doc(term.id);
    const getComments = useCollection(getCommentsRef(termRef));
    const getTranslations = useCollection(getTranslationsRef(termRef));
    const navigate = useSafeNavigate();
    const { t } = useTranslation();
    const [lang] = useLang();
    const definition = term.definition[lang === langA ? 'langA' : 'langB'];

    const translations = getTranslations();
    const pathToTerm = generatePath(TERM, { termId: term.id });

    return (
        <article
            className={clsx(s.term, s[size], getDominantLanguageClass(term.lang))}
            onClick={() => navigate(pathToTerm)}
        >
            {showMeta && (
                <div className={s.meta}>
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
            <div className={s.inner}>
                <header className={s.header}>
                    <h1 lang={term.lang} className={s.heading}>
                        <Link onClick={stopPropagation} className={s.headingLink} to={pathToTerm}>
                            <Redact>{term.value}</Redact>
                        </Link>
                    </h1>
                </header>
                <div className={s.body}>
                    {size === 'medium' && (
                        <>
                            <section className={s.section}>
                                {definition && <p className={s.definition}>{definition}</p>}
                                {!!translations.length && (
                                    <h2 className={s.bodyHeading}>
                                        {translations.length}{' '}
                                        {t(
                                            term.adminTags.translationsAsVariants
                                                ? 'term.variants.variant'
                                                : 'common.entities.translation.value',
                                            {
                                                count: translations.length,
                                            }
                                        )}
                                        :
                                    </h2>
                                )}
                                <div className={s.sectionBody}>
                                    <TranslationsList
                                        term={term}
                                        getTranslations={getTranslations}
                                        getSources={() => EMPTY_ARRAY}
                                        size="small"
                                        itemsClickable={false}
                                    />
                                </div>
                            </section>
                            <Suspense fallback={null}>
                                <InlineComments term={term} pathToTerm={pathToTerm} getComments={getComments} />
                            </Suspense>
                        </>
                    )}
                    {(size === 'small' || size === 'tiny') && (
                        <div className={s.smallSummary}>
                            <div className={s.smallSummaryTranslation}>
                                {translations.length ? (
                                    <ul className={s.smallSummaryTranslationList}>
                                        {translations.map(translation => (
                                            <li key={translation.id} className={s.smallSummaryTranslationListItem}>
                                                <TermWithLang term={translation} />
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className={s.smallSummaryEmpty}>{t('translation.emptyShort')}</div>
                                )}
                            </div>
                            {size === 'small' && (
                                <footer className={s.footer}>
                                    {term.commentCount}{' '}
                                    {t('common.entities.comment.value', { count: term.commentCount })}
                                </footer>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}

type InlineCommentsProps = {
    term: Term;
    pathToTerm: string;
    getComments: GetList<Comment>;
};

function InlineComments({ term, pathToTerm, getComments }: InlineCommentsProps) {
    const { t } = useTranslation();
    const comments = getComments();

    if (!comments.length) {
        return null;
    }

    return (
        <>
            <section className={s.section}>
                <h2 className={s.bodyHeading}>
                    {term.commentCount} {t('common.entities.comment.value', { count: term.commentCount })}:
                </h2>
                <div className={s.sectionBody}>
                    {comments.map(comment => (
                        <CommentItem key={comment.id} size="small" comment={comment} />
                    ))}

                    <div className={s.commentFooter}>
                        <span>
                            {term.commentCount} {t('common.entities.comment.value', { count: term.commentCount })}{' '}
                            <Link onClick={stopPropagation} to={pathToTerm}>
                                {t('common.viewAll')}
                            </Link>
                        </span>
                    </div>
                </div>
            </section>
        </>
    );
}
