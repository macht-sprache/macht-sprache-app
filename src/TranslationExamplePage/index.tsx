import clsx from 'clsx';
import { Trans, useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';
import Comments from '../Comments';
import { CoverIcon } from '../CoverIcon';
import { ExampleText } from '../ExampleText';
import { FormatDate } from '../FormatDate';
import Header from '../Header';
import { collections } from '../hooks/data';
import { Get, useDocument } from '../hooks/fetch';
import { Redact } from '../RedactSensitiveTerms';
import { TERM, TRANSLATION } from '../routes';
import { DocReference, Source, Term, Translation, TranslationExample } from '../types';
import { getDominantLanguageClass } from '../useLangCssVars';
import { UserInlineDisplay } from '../UserInlineDisplay';
import { extractRootDomain, trimString } from '../utils';
import s from './style.module.css';

type Props = {
    getTerm: Get<Term>;
    getTranslation: Get<Translation>;
    getTranslationExample: Get<TranslationExample>;
};

export default function TranslationExamplePageWrapper() {
    const { termId, translationId, translationExampleId } = useParams<{
        termId: string;
        translationId: string;
        translationExampleId: string;
    }>();
    const getTerm = useDocument(collections.terms.doc(termId));
    const getTranslation = useDocument(collections.translations.doc(translationId));
    const getTranslationExample = useDocument(collections.translationExamples.doc(translationExampleId));
    const props = { getTerm, getTranslation, getTranslationExample };
    return <TranslationExamplePage {...props} />;
}

function TranslationExamplePage({ getTerm, getTranslation, getTranslationExample }: Props) {
    const { t } = useTranslation();
    const term = getTerm();
    const translation = getTranslation();
    const translationExample = getTranslationExample();

    const getOriginalSource = useDocument(translationExample.original.source as DocReference<Source>);
    const getTranslatedSource = useDocument(translationExample.translated.source as DocReference<Source>);

    const originalSource = getOriginalSource();
    const translatedSource = getTranslatedSource();

    return (
        <>
            <Header
                topHeading={[
                    {
                        to: generatePath(TERM, { termId: term.id }),
                        inner: <Redact>{term.value}</Redact>,
                        lang: term.lang,
                    },
                    {
                        to: generatePath(TRANSLATION, { termId: term.id, translationId: translation.id }),
                        inner: <Redact>{translation.value}</Redact>,
                        lang: translation.lang,
                    },
                ]}
                subLine={
                    <p>
                        <Trans
                            t={t}
                            i18nKey="common.addedOn"
                            components={{
                                User: <UserInlineDisplay {...translationExample.creator} />,
                                FormatDate: <FormatDate date={translationExample.createdAt} />,
                            }}
                        />
                        <br />
                        <ExampleSubLine source={originalSource} />
                    </p>
                }
            >
                {t('translationExample.page.heading')}
                {originalSource.title}
            </Header>

            <div className={s.body}>
                <MediaSummary source={originalSource} isOriginal={true} />
                <MediaSummary source={translatedSource} />

                <ExampleText lang={term.lang} snippet={translationExample.original} className={s.snippetOriginal} />
                <ExampleText
                    lang={translation.lang}
                    snippet={translationExample.translated}
                    className={s.snippetTranslated}
                />

                <div className={clsx(s.comments, getDominantLanguageClass(translation.lang))}>
                    <Comments
                        entityRef={collections.translationExamples.doc(translationExample.id)}
                        commentCount={translationExample.commentCount}
                    />
                </div>
            </div>
        </>
    );
}

function ExampleSubLine({ source }: { source: Source }) {
    const { t } = useTranslation();

    switch (source.type) {
        case 'BOOK':
            return (
                <>
                    {t('translationExample.page.subLine.BOOK', {
                        author: source.authors.join(', '),
                        year: source.year,
                        publisher: source.publisher,
                    })}
                </>
            );
        case 'MOVIE':
            return (
                <>
                    {t('translationExample.page.subLine.MOVIE', {
                        director: source.directors?.join(', '),
                        year: source.year,
                    })}
                </>
            );
        case 'WEBPAGE':
            return (
                <Trans
                    t={t}
                    i18nKey="translationExample.page.subLine.WEBPAGE"
                    values={{ domain: extractRootDomain(source.url) }}
                    components={{ Date: source.date && <FormatDate date={new Date(source.date)} /> }}
                />
            );
    }
}

function MediaSummary({ source, isOriginal = false }: { source: Source; isOriginal?: boolean }) {
    return (
        <div className={clsx(s.bookContainer, { [s.original]: isOriginal, [s.translated]: !isOriginal })}>
            <div className={s.bookIconContainer}>
                <CoverIcon item={source} className={s.bookIcon} />
            </div>
            <div className={s.meta}>
                <h3 className={s.heading} lang={source.lang}>
                    {trimString(source.title)}
                </h3>
                <dl className={s.definitionList}>
                    <MediaMetaData source={source} />
                </dl>
            </div>
        </div>
    );
}

function MediaMetaData({ source }: { source: Source }) {
    const { t } = useTranslation();

    switch (source.type) {
        case 'BOOK':
            return (
                <>
                    <DefintionListItem definition={t('translationExample.publisher')}>
                        {source.publisher}
                    </DefintionListItem>
                    <DefintionListItem definition={t('translationExample.year')}>{source.year}</DefintionListItem>
                    <DefintionListItem definition="ISBN">{source.isbn}</DefintionListItem>
                </>
            );
        case 'MOVIE':
            return (
                <>
                    <DefintionListItem definition={t('translationExample.year')}>{source.year}</DefintionListItem>
                </>
            );
        case 'WEBPAGE':
            return (
                <>
                    {source.date && (
                        <DefintionListItem definition={t('translationExample.published')}>
                            <FormatDate date={new Date(source.date)} />
                        </DefintionListItem>
                    )}
                    <DefintionListItem definition={t('translationExample.link')}>
                        <a href={source.url} target="_blank" rel="noreferrer" className={s.sourceLink}>
                            {trimString(source.url, 40)}
                        </a>
                    </DefintionListItem>
                </>
            );
    }
}

const DefintionListItem = ({ definition, children }: { definition: React.ReactNode; children: React.ReactNode }) => (
    <>
        <dt className={s.definitionListKey}>{definition}</dt>
        <dd className={s.definitionListValue}>{children}</dd>
    </>
);
