import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import Comments from '../Comments';
import { FormatDate } from '../FormatDate';
import Header from '../Header';
import { collections, useTerm } from '../hooks/data';
import { FullWidthColumn, SingleColumn } from '../Layout/Columns';
import { Redact, useRedacted } from '../RedactSensitiveTerms';
import { TermWithLang } from '../TermWithLang';
import { TranslationsList } from '../TranslationsList';
import { getDominantLanguageClass } from '../useLangCssVars';

export default function TermPage() {
    const { termId } = useParams<{ termId: string }>();
    const { t } = useTranslation();
    const term = useTerm(termId);
    const termRedacted = useRedacted(term.value);

    return (
        <>
            <Header
                capitalize
                subLine={
                    <Trans
                        t={t}
                        i18nKey="common.addedOn"
                        components={{
                            User: term.creator.displayName,
                            FormatDate: <FormatDate date={term.createdAt && term.createdAt.toDate()} />,
                        }}
                    />
                }
                mainLang={term.lang}
            >
                <Redact>{term.value}</Redact>
            </Header>

            <FullWidthColumn>
                <TranslationsList term={term} />
            </FullWidthColumn>

            <SingleColumn>
                <div className={getDominantLanguageClass(term.lang)}>
                    <Comments
                        entityRef={collections.terms.doc(termId)}
                        headingHint={
                            <Trans
                                t={t}
                                i18nKey="term.addCommentHeading"
                                components={{ Term: <TermWithLang term={term} /> }}
                            />
                        }
                        placeholder={t('term.commentPlaceholder', { term: termRedacted })}
                    />
                </div>
            </SingleColumn>
        </>
    );
}
