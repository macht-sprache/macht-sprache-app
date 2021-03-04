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
import { Term, Translation, TranslationExample, BookSnippet, WebPageSnippet, Lang } from '../types';
import { extractRootDomain, trimString } from '../utils';
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
                    <HeaderWrapperBook
                        langOriginal={term.lang}
                        langTranslated={translation.lang}
                        snippetOriginal={example.original}
                        snippetTranslated={example.translated}
                    />
                )}
                {example.type === 'WEBPAGE' && (
                    <HeaderWrapperWebsite
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

function HeaderWrapperWebsite({
    snippetOriginal,
    snippetTranslated,
    langOriginal,
    langTranslated,
}: {
    snippetOriginal: WebPageSnippet;
    snippetTranslated: WebPageSnippet;
    langOriginal: Lang;
    langTranslated: Lang;
}) {
    const original = useDocument(snippetOriginal.source);
    const translated = useDocument(snippetTranslated.source);

    return (
        <Header
            coverUrl={original.imageUrl}
            aboveHeading={extractRootDomain(original.url)}
            titleOriginal={original.title}
            titleTranslated={translated.title}
            langOriginal={langOriginal}
            langTranslated={langTranslated}
        />
    );
}

function HeaderWrapperBook({
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
    const original = useDocument(snippetOriginal.source);
    const translated = useDocument(snippetTranslated.source);

    return (
        <Header
            coverUrl={original.coverUrl}
            aboveHeading={original.authors.join(', ')}
            titleOriginal={original.title}
            titleTranslated={translated.title}
            langOriginal={langOriginal}
            langTranslated={langTranslated}
        />
    );
}

function Header({
    coverUrl,
    aboveHeading,
    titleOriginal,
    titleTranslated,
    langOriginal,
    langTranslated,
}: {
    coverUrl?: string;
    aboveHeading?: string;
    titleOriginal: string;
    titleTranslated: string;
    langOriginal: Lang;
    langTranslated: Lang;
}) {
    return (
        <header className={s.header}>
            {coverUrl && (
                <div className={s.headingImgContainer}>
                    <img className={s.headingImg} alt="" src={coverUrl} />
                </div>
            )}
            <div>
                {aboveHeading}
                <h1 className={s.headingOriginal} lang={langOriginal}>
                    {trimString(titleTranslated)}
                </h1>
                <h1 className={s.headingTranslated} lang={langTranslated}>
                    {trimString(titleOriginal)}
                </h1>
            </div>
        </header>
    );
}
