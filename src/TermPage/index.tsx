import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import Comments from '../Comments';
import { collections, useTerm } from '../hooks/data';
import { FormatDate } from '../FormatDate';
import Header from '../Header';
import { Columns } from '../Layout/Columns';
import { TranslationsList } from '../TranslationsList';

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
                        i18nKey="term.addedOn"
                        components={{
                            User: term.creator.displayName,
                            FormatDate: <FormatDate date={term.createdAt && term.createdAt.toDate()} />,
                        }}
                    />
                }
                mainLang={term.lang}
            >
                {term.value}
            </Header>
            <Columns>
                <TranslationsList term={term} />
                <Comments entityRef={collections.terms.doc(termId)} />
            </Columns>
        </>
    );
}
