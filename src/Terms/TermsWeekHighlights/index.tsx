import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { generatePath, useHistory } from 'react-router';
import { Link } from 'react-router-dom';
import { CommentItem } from '../../Comments/CommentItem';
import { collections, useComments, useTerms, useTranslations } from '../../hooks/data';
import { TERM } from '../../routes';
import { TranslationsList } from '../../TranslationsList';
import { Term } from '../../types';
import { getDominantLanguageClass } from '../../useLangCssVars';
import { stopPropagation } from '../../utils';
import s from './style.module.css';

export function TermsWeekHighlights() {
    const terms = useTerms();

    const highlightedTerms = terms
        .filter(term => term.weekHighlight)
        .sort((termA, termB) => termA.value.localeCompare(termB.value, termA.lang));

    return (
        <div className={s.container}>
            {highlightedTerms.map(term => (
                <TermItem key={term.id} term={term} />
            ))}
        </div>
    );
}

function TermItem({ term }: { term: Term }) {
    const comments = useComments(collections.terms.doc(term.id));
    const translations = useTranslations(term.id);
    const history = useHistory();

    const { t } = useTranslation();
    const pathToTerm = generatePath(TERM, { termId: term.id });

    return (
        <article className={clsx(s.term, getDominantLanguageClass(term.lang))} onClick={() => history.push(pathToTerm)}>
            <header className={s.header}>
                <h1 lang={term.lang} className={s.heading}>
                    <Link onClick={stopPropagation} className={s.headingLink} to={pathToTerm}>
                        {term.value}
                    </Link>
                </h1>
            </header>
            <div className={s.body}>
                <section className={s.section}>
                    <h2 className={s.bodyHeading}>
                        {translations.length} {t('common.entities.translation.value', { count: translations.length })}:
                    </h2>
                    <div className={s.sectionBody}>
                        <TranslationsList term={term} size="small" />
                    </div>
                </section>
                {!!comments.length && (
                    <>
                        <section className={s.section}>
                            <h2 className={s.bodyHeading}>
                                {term.commentCount} {t('common.entities.comment.value', { count: term.commentCount })}:
                            </h2>
                            <div className={s.sectionBody}>
                                <CommentItem size="small" comment={comments[comments.length - 1]} />
                                <div className={s.commentFooter}>
                                    {term.commentCount}{' '}
                                    {t('common.entities.comment.value', { count: term.commentCount })}{' '}
                                    <Link to={pathToTerm}>view all</Link>
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </article>
    );
}
