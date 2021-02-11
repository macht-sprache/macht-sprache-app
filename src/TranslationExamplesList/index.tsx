import { Trans, useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';
import { CommentWrapper } from '../Comments/CommentWrapper';
import { ButtonLink } from '../Form/Button';
import { useTranslationExamples, useDocument } from '../hooks/data';
import { ColumnHeading } from '../Layout/Columns';
import { LoginHint } from '../LoginHint';
import { TRANSLATION_EXAMPLE_ADD } from '../routes';
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
        <article className={s.example}>
            {example.original.type === 'BOOK' && <Heading lang={term.lang} snippet={example.original} />}
            <div lang={term.lang} className={s.exampleTextOriginal}>
                <TextWithHighlights text={example.original.text} highlighted={example.original.matches} />
            </div>
            <div lang={translation.lang} className={s.exampleTextTranslated}>
                <TextWithHighlights text={example.translated.text} highlighted={example.translated.matches} />
            </div>
            <footer className={s.footer}>
                {t('common.entities.comment.withCount', { count: example.commentCount })}
            </footer>
        </article>
    );
}

function Heading({ snippet, lang }: { snippet: BookSnippet; lang: Lang }) {
    const book = useDocument(snippet.source);

    return (
        <h1 className={s.heading} lang={lang}>
            {book.title}
        </h1>
    );
}
