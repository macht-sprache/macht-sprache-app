import clsx from 'clsx';
import { Trans, useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';
import Comments from '../../components/Comments';
import ConfirmModal from '../../components/ConfirmModal';
import { CoverIcon } from '../../components/CoverIcon';
import { ExampleText } from '../../components/ExampleText';
import { FormatDate } from '../../components/FormatDate';
import Header from '../../components/Header';
import { useAppContext } from '../../hooks/appContext';
import { collections, getSourceRefWithConverter } from '../../hooks/data';
import { Get, useDocument } from '../../hooks/fetch';
import LinkButton from '../../components/LinkButton';
import PageTitle from '../../components/PageTitle';
import { Redact } from '../../components/RedactSensitiveTerms';
import { TERM, TRANSLATION } from '../../routes';
import Share from '../../components/Share';
import SidebarTermRedirectWrapper from '../../components/SidebarTermRedirectWrapper';
import { Source, Term, Translation, TranslationExample } from '../../types';
import { getDominantLanguageClass } from '../../useLangCssVars';
import { UserInlineDisplay } from '../../components/UserInlineDisplay';
import { extractRootDomain, trimString } from '../../utils';
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
    return (
        <SidebarTermRedirectWrapper getTerm={getTerm}>
            <TranslationExamplePage {...props} />
        </SidebarTermRedirectWrapper>
    );
}

function TranslationExamplePage({ getTerm, getTranslation, getTranslationExample }: Props) {
    const { t } = useTranslation();
    const { userProperties } = useAppContext();
    const term = getTerm();
    const translation = getTranslation();
    const translationExample = getTranslationExample();

    const getOriginalSource = useDocument(getSourceRefWithConverter(translationExample.original.source));
    const getTranslatedSource = useDocument(getSourceRefWithConverter(translationExample.translated.source));

    const originalSource = getOriginalSource();
    const translatedSource = getTranslatedSource();

    const canDelete = userProperties?.admin;

    return (
        <>
            <PageTitle title={`${t('translationExample.page.heading')} ${trimString(originalSource.title, 300)}`} />
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
                    <>
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
                            {canDelete && (
                                <>
                                    {' | '}
                                    <DeleteTranslationExample translationExample={translationExample} />
                                </>
                            )}
                        </p>
                        <Share
                            itemTranslated={t('common.entities.translatioExample.value')}
                            title={`macht.sprache.: ${translation.value}`}
                            text={t('translationExample.share', { example: trimString(originalSource.title, 160) })}
                        />
                    </>
                }
            >
                {t('translationExample.page.heading')}
                <Redact>{trimString(originalSource.title, 300)}</Redact>
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
                        headingHint={t('translationExample.addCommentHeading')}
                        placeholder={t('translationExample.commentPlaceholder')}
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
                    {source.authors.length &&
                        t('translationExample.page.subLine.BOOK.author', {
                            author: source.authors.join(', '),
                        })}
                    {(source.publisher || source.year) && t('translationExample.page.subLine.BOOK.published')}
                    {source.publisher &&
                        t('translationExample.page.subLine.BOOK.publishedBy', {
                            publisher: source.publisher,
                        })}
                    {source.year &&
                        t('translationExample.page.subLine.BOOK.year', {
                            year: source.year,
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
                <>
                    {t('translationExample.page.subLine.WEBPAGE.website', {
                        domain: extractRootDomain(source.url),
                    })}
                    {source.date && (
                        <>
                            {' '}
                            <Trans
                                t={t}
                                i18nKey="translationExample.page.subLine.WEBPAGE.date"
                                components={{ Date: <FormatDate date={new Date(source.date)} /> }}
                            />
                        </>
                    )}
                </>
            );
    }
}

function MediaSummary({ source, isOriginal = false }: { source: Source; isOriginal?: boolean }) {
    const trimLength = 100;
    return (
        <div className={clsx(s.bookContainer, { [s.original]: isOriginal, [s.translated]: !isOriginal })}>
            <div className={s.bookIconContainer}>
                <CoverIcon item={source} className={s.bookIcon} />
            </div>
            <div className={s.meta}>
                <h3
                    className={s.heading}
                    lang={source.lang}
                    title={source.title.length > trimLength ? source.title : undefined}
                >
                    <Redact>{trimString(source.title, trimLength)}</Redact>
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

const DefintionListItem = ({ definition, children }: { definition: React.ReactNode; children: React.ReactNode }) => {
    if (!children) return null;

    return (
        <>
            <dt className={s.definitionListKey}>{definition}</dt>
            <dd className={s.definitionListValue}>{children}</dd>
        </>
    );
};

function DeleteTranslationExample({ translationExample }: { translationExample: TranslationExample }) {
    const { t } = useTranslation();

    return (
        <ConfirmModal
            title={t('translationExample.deleteHeading')}
            body={<p>{t('translationExample.deleteExplanation')}</p>}
            confirmLabel={t('common.formNav.delete')}
            onConfirm={() => collections.translationExamples.doc(translationExample.id).delete()}
        >
            {onClick => <LinkButton onClick={onClick}>{t('common.formNav.delete')}</LinkButton>}
        </ConfirmModal>
    );
}
