import clsx from 'clsx';
import { Trans, useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';
import { FormatDate } from '../FormatDate';
import Comments from '../Comments';
import Header from '../Header';
import { collections, useTerm, useTranslationEntity } from '../hooks/data';
import { SingleColumn } from '../Layout/Columns';
import { RatingWidgetContainer } from '../Rating/RatingWidget';
import { Redact, useRedacted } from '../RedactSensitiveTerms';
import { TERM } from '../routes';
import TranslationExamplesList from '../TranslationExamplesList';
import { getDominantLanguageClass } from '../useLangCssVars';
import s from './style.module.css';
import { TermWithLang } from '../TermWithLang';

export function TranslationPage() {
    const { t } = useTranslation();
    const { termId, translationId } = useParams<{ termId: string; translationId: string }>();
    const term = useTerm(termId);
    const translation = useTranslationEntity(translationId);
    const termRedacted = useRedacted(term.value);
    const translationRedacted = useRedacted(translation.value);

    return (
        <>
            <Header
                capitalize
                mainLang={translation.lang}
                topHeading={[
                    {
                        to: generatePath(TERM, { termId: term.id }),
                        inner: <Redact>{term.value}</Redact>,
                        lang: term.lang,
                    },
                ]}
                rating={
                    <div className={clsx(s.rating, getDominantLanguageClass(translation.lang))}>
                        <RatingWidgetContainer term={term} translation={translation} />
                    </div>
                }
                subLine={
                    <Trans
                        t={t}
                        i18nKey="common.addedOn"
                        components={{
                            User: translation.creator.displayName,
                            FormatDate: <FormatDate date={translation.createdAt.toDate()} />,
                        }}
                    />
                }
            >
                <Redact>{translation.value}</Redact>
            </Header>
            <TranslationExamplesList term={term} translation={translation} />
            <SingleColumn>
                <div className={getDominantLanguageClass(translation.lang)}>
                    <Comments
                        entityRef={collections.translations.doc(translation.id)}
                        headingHint={
                            <Trans
                                t={t}
                                i18nKey="translation.addCommentHeading"
                                components={{
                                    Term: <TermWithLang term={term} />,
                                    Translation: <TermWithLang term={translation} />,
                                }}
                            />
                        }
                        placeholder={t('translation.commentPlaceholder', {
                            term: termRedacted,
                            translation: translationRedacted,
                        })}
                    />
                </div>
            </SingleColumn>
        </>
    );
}
