import clsx from 'clsx';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import Comments from '../Comments';
import { FormatDate } from '../FormatDate';
import Header from '../Header';
import { collections, useTerm } from '../hooks/data';
import { SingleColumn } from '../Layout/Columns';
import { Redact } from '../RedactSensitiveTerms';
import { TranslationsList } from '../TranslationsList';
import { getDominantLanguageClass } from '../useLangCssVars';

export default function TermPage() {
    const { termId } = useParams<{ termId: string }>();
    const { t } = useTranslation();
    const term = useTerm(termId);

    return (
        <>
            <Header
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
            <div>
                <TranslationsList term={term} />

                <SingleColumn>
                    <div className={clsx(getDominantLanguageClass(term.lang))}>
                        <Comments entityRef={collections.terms.doc(termId)} />
                    </div>
                </SingleColumn>
            </div>
        </>
    );
}
