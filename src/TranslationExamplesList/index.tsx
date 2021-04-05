import clsx from 'clsx';
import { Trans, useTranslation } from 'react-i18next';
import { generatePath, Link } from 'react-router-dom';
import { AddEntityButton } from '../AddEntityButton';
import { CoverIcon } from '../CoverIcon';
import { FormatDate } from '../FormatDate';
import { GetList } from '../hooks/fetch';
import { ColumnHeading, FullWidthColumn } from '../Layout/Columns';
import { TRANSLATION_EXAMPLE, TRANSLATION_EXAMPLE_ADD } from '../routes';
import { TermWithLang } from '../TermWithLang';
import { Source, Term, Translation, TranslationExample } from '../types';
import { getDominantLanguageClass } from '../useLangCssVars';
import { extractRootDomain, trimString } from '../utils';
import s from './style.module.css';

type Props = {
    term: Term;
    translation: Translation;
    getTranslationExamples: GetList<TranslationExample>;
    getSources: GetList<Source>;
};

export default function TranslationExamplesList({ term, translation, getTranslationExamples, getSources }: Props) {
    const { t } = useTranslation();
    const translationExamples = getTranslationExamples();
    const sources = getSources();

    return (
        <FullWidthColumn>
            <ColumnHeading>{t('common.entities.translatioExample.value_plural')}</ColumnHeading>
            {!translationExamples.length && (
                <p>
                    <Trans
                        t={t}
                        i18nKey={'translationExample.empty'}
                        components={{
                            Term: <TermWithLang term={term} />,
                            Translation: <TermWithLang term={translation} />,
                        }}
                    />
                </p>
            )}
            <div className={s.list}>
                {translationExamples.map(translationExample => (
                    <TranslationExampleArticle
                        key={translationExample.id}
                        term={term}
                        translation={translation}
                        example={translationExample}
                        originalSource={sources.find(source => source.id === translationExample.original.source.id)}
                    />
                ))}
                <AddEntityButton
                    to={generatePath(TRANSLATION_EXAMPLE_ADD, {
                        termId: term.id,
                        translationId: translation.id,
                    })}
                >
                    {t('common.entities.translatioExample.add')}
                    <div className={s.buttonExample}>{t('translationExample.example')}</div>
                </AddEntityButton>
            </div>
        </FullWidthColumn>
    );
}

function TranslationExampleArticle({
    example,
    originalSource,
    term,
    translation,
}: {
    example: TranslationExample;
    originalSource?: Source;
    term: Term;
    translation: Translation;
}) {
    const { t } = useTranslation();
    const cover = <CoverIcon item={originalSource} className={s.cover} />;

    return (
        <Link
            to={generatePath(TRANSLATION_EXAMPLE, {
                termId: term.id,
                translationId: translation.id,
                translationExampleId: example.id,
            })}
            className={clsx(s.link, getDominantLanguageClass(translation.lang))}
        >
            <article className={s.example}>
                {originalSource && getSurtitle(originalSource)}
                <h1 className={s.headingOriginal} lang={term.lang}>
                    {trimString(originalSource?.title)}
                </h1>
                {cover && <div className={s.coverContainer}>{cover}</div>}

                <footer className={s.footer}>
                    <div>{t('common.entities.comment.withCount', { count: example.commentCount })}</div>
                    <div>
                        <FormatDate date={translation.createdAt} />
                    </div>
                </footer>
            </article>
        </Link>
    );
}

function getSurtitle(source: Source) {
    switch (source.type) {
        case 'BOOK':
            return source.authors.join(', ');
        case 'WEBPAGE':
            return extractRootDomain(source.url);
        case 'MOVIE':
            return source.directors?.join(', ');
    }
}
