import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';
import { BookCoverIcon } from '../BookCoverIcon';
import Comments from '../Comments';
import { ExampleText } from '../ExampleText';
import Header from '../Header';
import { collections, useDocument, useTerm, useTranslationEntity, useTranslationExample } from '../hooks/data';
import { TERM, TRANSLATION } from '../routes';
import { BookSource, BookTranslationExample, Term, Translation } from '../types';
import s from './style.module.css';

export function TranslationExamplePage() {
    const { termId, translationId, translationExampleId } = useParams<{
        termId: string;
        translationId: string;
        translationExampleId: string;
    }>();
    const term = useTerm(termId);
    const translation = useTranslationEntity(translationId);
    const translationExample = useTranslationExample(translationExampleId);

    if (translationExample.type === 'BOOK') {
        return <BookPage term={term} translation={translation} translationExample={translationExample} />;
    }

    return <>no book! it's a {translationExample.type}</>;
}

function BookPage({
    term,
    translation,
    translationExample,
}: {
    term: Term;
    translation: Translation;
    translationExample: BookTranslationExample;
}) {
    const bookOriginal = useDocument(translationExample.original.source);
    const bookTranslated = useDocument(translationExample.translated.source);
    const { t } = useTranslation();

    return (
        <>
            <Header
                topHeading={[
                    {
                        to: generatePath(TERM, { termId: term.id }),
                        inner: term.value,
                        lang: term.lang,
                    },
                    {
                        to: generatePath(TRANSLATION, { termId: term.id, translationId: translation.id }),
                        inner: translation.value,
                        lang: translation.lang,
                    },
                ]}
                subLine={
                    <p>
                        {t('translationExample.page.subLine', {
                            author: bookOriginal.authors.join(', '),
                            year: bookOriginal.year,
                            publisher: bookOriginal.publisher,
                        })}
                    </p>
                }
            >
                {t('translationExample.page.heading')}
                {bookOriginal.title}
            </Header>

            <div className={s.body}>
                <Book source={bookOriginal} isOriginal={true} />
                <Book source={bookTranslated} />

                <ExampleText lang={term.lang} snippet={translationExample.original} className={s.snippetOriginal} />
                <ExampleText
                    lang={translation.lang}
                    snippet={translationExample.translated}
                    className={s.snippetTranslated}
                />

                <div className={s.comments}>
                    <Comments entityRef={collections.translationExamples.doc(translationExample.id)} />
                </div>
            </div>
        </>
    );
}

function Book({ source, isOriginal = false }: { source: BookSource; isOriginal?: boolean }) {
    const { t } = useTranslation();

    return (
        <div className={clsx(s.bookContainer, { [s.original]: isOriginal, [s.translated]: !isOriginal })}>
            <div className={s.bookIconContainer}>
                <BookCoverIcon item={source} className={s.bookIcon} />
            </div>
            <div className={s.meta}>
                <h3 className={s.heading}>{source.title}</h3>
                <dl className={s.definitionList}>
                    <DefintionListItem definition={t('translationExample.publisher')}>
                        {source.publisher}
                    </DefintionListItem>
                    <DefintionListItem definition={t('translationExample.year')}>{source.year}</DefintionListItem>
                    <DefintionListItem definition="ISBN">{source.isbn}</DefintionListItem>
                </dl>
            </div>
        </div>
    );
}

const DefintionListItem = ({ definition, children }: { definition: React.ReactNode; children: React.ReactNode }) => (
    <>
        <dt className={s.definitionListKey}>{definition}</dt>
        <dd className={s.definitionListValue}>{children}</dd>
    </>
);
