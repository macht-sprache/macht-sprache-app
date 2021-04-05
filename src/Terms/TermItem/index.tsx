import clsx from 'clsx';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, useHistory } from 'react-router';
import { Link } from 'react-router-dom';
import { CommentItem } from '../../Comments/CommentItem';
import { collections, getCommentsRef, getTranslationsRef } from '../../hooks/data';
import { GetList, useCollection } from '../../hooks/fetch';
import { Redact } from '../../RedactSensitiveTerms';
import { TERM } from '../../routes';
import { TermWithLang } from '../../TermWithLang';
import { TranslationsList } from '../../TranslationsList';
import { Comment, Term } from '../../types';
import { getDominantLanguageClass } from '../../useLangCssVars';
import { stopPropagation } from '../../utils';
import s from './style.module.css';

const EMPTY_ARRAY: never[] = [];

type TermItemProps = { term: Term; size?: 'small' | 'medium' };

export function TermItem({ term, size = 'medium' }: TermItemProps) {
    const termRef = collections.terms.doc(term.id);
    const getComments = useCollection(getCommentsRef(termRef));
    const getTranslations = useCollection(getTranslationsRef(termRef));
    const history = useHistory();
    const { t } = useTranslation();

    const translations = getTranslations();
    const pathToTerm = generatePath(TERM, { termId: term.id });

    return (
        <article
            className={clsx(s.term, s[size], getDominantLanguageClass(term.lang))}
            onClick={() => history.push(pathToTerm)}
        >
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
                            <h2 className={s.bodyHeading}>
                                {translations.length}{' '}
                                {t('common.entities.translation.value', { count: translations.length })}:
                            </h2>
                            <div className={s.sectionBody}>
                                <TranslationsList
                                    term={term}
                                    getTranslations={getTranslations}
                                    getSources={() => EMPTY_ARRAY}
                                    size="small"
                                />
                            </div>
                        </section>
                        <Suspense fallback={null}>
                            <InlineComments term={term} pathToTerm={pathToTerm} getComments={getComments} />
                        </Suspense>
                    </>
                )}
                {size === 'small' && (
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
                        <footer className={s.footer}>
                            {term.commentCount} {t('common.entities.comment.value', { count: term.commentCount })}
                        </footer>
                    </div>
                )}
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
