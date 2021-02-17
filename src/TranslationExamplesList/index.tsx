import { Trans, useTranslation } from 'react-i18next';
import { generatePath, Link } from 'react-router-dom';
import { CommentWrapper } from '../Comments/CommentWrapper';
import { ExampleText } from '../ExampleText';
import { ButtonLink } from '../Form/Button';
import { useTranslationExamples, useDocument } from '../hooks/data';
import { ColumnHeading } from '../Layout/Columns';
import { LoginHint } from '../LoginHint';
import { TRANSLATION_EXAMPLE, TRANSLATION_EXAMPLE_ADD } from '../routes';
import { TermWithLang } from '../TermWithLang';
import TextWithHighlights from '../TextWithHighlights';
import { Term, Translation, TranslationExample, BookSnippet, Lang } from '../types';
import s from './style.module.css';

type Props = {
    term: Term;
    translation: Translation;
};

export default function TranslationExamplesList({ term, translation }: Props) {
    const { t } = useTranslation();
    const translationExamples = useTranslationExamples(translation.id);

    return (
        <CommentWrapper>
            <ColumnHeading>{t('common.entities.translatioExample.value_plural')}</ColumnHeading>
            {!translationExamples.length && (
                <p>
                    <Trans
                        t={t}
                        i18nKey={'translationExample.empty'}
                        components={{ Term: <TermWithLang term={term} /> }}
                        values={{ term: term.value }}
                    />
                </p>
            )}
            {!!translationExamples.length && (
                <div>
                    {translationExamples.map(translationExample => (
                        <TranslationExampleArticle
                            key={translationExample.id}
                            term={term}
                            translation={translation}
                            example={translationExample}
                        />
                    ))}
                </div>
            )}
            <div className={s.addExampleButton}>
                <LoginHint i18nKey="translationExample.registerToAdd">
                    <ButtonLink
                        to={generatePath(TRANSLATION_EXAMPLE_ADD, { termId: term.id, translationId: translation.id })}
                    >
                        {t('common.entities.translatioExample.add')}
                    </ButtonLink>
                </LoginHint>
            </div>
        </CommentWrapper>
    );
}

function TranslationExampleArticle({
    example,
    term,
    translation,
}: {
    example: TranslationExample;
    term: Term;
    translation: Translation;
}) {
    const { t } = useTranslation();

    return (
        <Link
            to={generatePath(TRANSLATION_EXAMPLE, {
                termId: term.id,
                translationId: translation.id,
                translationExampleId: example.id,
            })}
            className={s.link}
        >
            <article className={s.example}>
                {example.type === 'BOOK' && (
                    <Header
                        langOriginal={term.lang}
                        langTranslated={translation.lang}
                        snippetOriginal={example.original}
                        snippetTranslated={example.translated}
                    />
                )}
                <ExampleText lang={term.lang} snippet={example.original} className={s.exampleTextOriginal} />
                <ExampleText lang={translation.lang} snippet={example.translated} className={s.exampleTextTranslated} />
                <footer className={s.footer}>
                    {t('common.entities.comment.withCount', { count: example.commentCount })}
                </footer>
            </article>
        </Link>
    );
}

function Header({
    snippetOriginal,
    snippetTranslated,
    langOriginal,
    langTranslated,
}: {
    snippetOriginal: BookSnippet;
    snippetTranslated: BookSnippet;
    langOriginal: Lang;
    langTranslated: Lang;
}) {
    const bookOriginal = useDocument(snippetOriginal.source);
    const bookTranslated = useDocument(snippetTranslated.source);

    return (
        <header className={s.header}>
            {bookOriginal.coverUrl && (
                <div className={s.headingImgContainer}>
                    <img className={s.headingImg} alt="" src={bookOriginal.coverUrl} />
                </div>
            )}
            <div>
                {bookOriginal.authors.join(', ')}
                <h1 className={s.headingOriginal} lang={langOriginal}>
                    {bookOriginal.title}
                </h1>
                <h1 className={s.headingTranslated} lang={langTranslated}>
                    {bookTranslated.title}
                </h1>
            </div>
        </header>
    );
}
