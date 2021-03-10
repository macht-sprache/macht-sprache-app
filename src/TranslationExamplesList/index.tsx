import { Trans, useTranslation } from 'react-i18next';
import { generatePath, Link } from 'react-router-dom';
import { CommentWrapper } from '../Comments/CommentWrapper';
import { ExampleText } from '../ExampleText';
import { ButtonContainer, ButtonLink } from '../Form/Button';
import { useTranslationExamples, useSources, collections } from '../hooks/data';
import { ColumnHeading } from '../Layout/Columns';
import { LoginHint } from '../LoginHint';
import { TRANSLATION_EXAMPLE, TRANSLATION_EXAMPLE_ADD } from '../routes';
import { TermWithLang } from '../TermWithLang';
import { Term, Translation, TranslationExample, Source } from '../types';
import { extractRootDomain, trimString } from '../utils';
import s from './style.module.css';
import { CoverIcon } from '../CoverIcon';

type Props = {
    term: Term;
    translation: Translation;
};

export default function TranslationExamplesList({ term, translation }: Props) {
    const { t } = useTranslation();
    const translationExamples = useTranslationExamples(translation.id);
    const sources = useSources(collections.translations.doc(translation.id))[translation.id];

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
                            originalSource={sources.find(source => source.id === translationExample.original.source.id)}
                            translatedSource={sources.find(
                                source => source.id === translationExample.translated.source.id
                            )}
                        />
                    ))}
                </div>
            )}
            <LoginHint i18nKey="translationExample.registerToAdd">
                <div className={s.addExampleButton}>
                    <ButtonContainer>
                        <ButtonLink
                            to={generatePath(TRANSLATION_EXAMPLE_ADD, {
                                termId: term.id,
                                translationId: translation.id,
                            })}
                        >
                            {t('common.entities.translatioExample.add')}
                        </ButtonLink>
                    </ButtonContainer>
                </div>
            </LoginHint>
        </CommentWrapper>
    );
}

function TranslationExampleArticle({
    example,
    originalSource,
    translatedSource,
    term,
    translation,
}: {
    example: TranslationExample;
    originalSource?: Source;
    translatedSource?: Source;
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
                <Header
                    term={term}
                    translation={translation}
                    originalSource={originalSource}
                    translatedSource={translatedSource}
                />
                <ExampleText lang={term.lang} snippet={example.original} className={s.exampleTextOriginal} />
                <ExampleText lang={translation.lang} snippet={example.translated} className={s.exampleTextTranslated} />
                <footer className={s.footer}>
                    {t('common.entities.comment.withCount', { count: example.commentCount })}
                </footer>
            </article>
        </Link>
    );
}

type HeaderProps = {
    term: Term;
    translation: Translation;
    originalSource?: Source;
    translatedSource?: Source;
};

function Header({ term, translation, originalSource, translatedSource }: HeaderProps) {
    const cover = <CoverIcon item={originalSource} className={s.cover} />;

    return (
        <header className={s.header}>
            {cover && <div className={s.coverContainer}>{cover}</div>}
            <div>
                {originalSource && getSurtitle(originalSource)}
                <h1 className={s.headingOriginal} lang={term.lang}>
                    {trimString(originalSource?.title)}
                </h1>
                <h1 className={s.headingTranslated} lang={translation.lang}>
                    {trimString(translatedSource?.title)}
                </h1>
            </div>
        </header>
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
