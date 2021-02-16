import { useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';
import Comments from '../Comments';
import Header from '../Header';
import { collections, useDocument, useTerm, useTranslationEntity, useTranslationExample } from '../hooks/data';
import { TERM, TRANSLATION } from '../routes';
import { BookTranslationExample, Term, Translation } from '../types';
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
                <div>beispiel!!</div>
                <div>beispiel!!</div>
                <div>beispiel!!</div>
                <div>beispiel!!</div>
                <div className={s.comments}>
                    <Comments entityRef={collections.translations.doc(translationExample.id)} />
                </div>
            </div>
        </>
    );
}
