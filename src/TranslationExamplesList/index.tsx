import { Trans, useTranslation } from 'react-i18next';
import { generatePath, Link } from 'react-router-dom';
import { CommentWrapper } from '../Comments/CommentWrapper';
import { ExampleText } from '../ExampleText';
import { ButtonLink } from '../Form/Button';
import { useTranslationExamples, useSources, collections } from '../hooks/data';
import { ColumnHeading } from '../Layout/Columns';
import { LoginHint } from '../LoginHint';
import { TRANSLATION_EXAMPLE, TRANSLATION_EXAMPLE_ADD } from '../routes';
import { TermWithLang } from '../TermWithLang';
import { Term, Translation, TranslationExample, Lang, Source } from '../types';
import { extractRootDomain, trimString } from '../utils';
import s from './style.module.css';

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

    const headerProps: HeaderProps = {
        langOriginal: term.lang,
        langTranslated: translation.lang,
        titleOriginal: originalSource?.title,
        titleTranslated: translatedSource?.title,
    };

    if (originalSource?.type === 'BOOK') {
        headerProps.coverUrl = originalSource.coverUrl;
        headerProps.surTitle = originalSource.authors.join(', ');
    }

    if (originalSource?.type === 'WEBPAGE') {
        headerProps.coverUrl = originalSource.imageUrl;
        headerProps.surTitle = extractRootDomain(originalSource.url);
    }

    if (originalSource?.type === 'MOVIE') {
        headerProps.coverUrl = originalSource.coverUrl;
        headerProps.surTitle = originalSource.directors && originalSource.directors.join(', ');
    }

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
                <Header {...headerProps} />
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
    coverUrl?: string;
    surTitle?: string;
    titleOriginal?: string;
    titleTranslated?: string;
    langOriginal: Lang;
    langTranslated: Lang;
};

function Header({ coverUrl, surTitle, titleOriginal, titleTranslated, langOriginal, langTranslated }: HeaderProps) {
    return (
        <header className={s.header}>
            {coverUrl && (
                <div className={s.headingImgContainer}>
                    <img className={s.headingImg} alt="" src={coverUrl} />
                </div>
            )}
            <div>
                {surTitle}
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
