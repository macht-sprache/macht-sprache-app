import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import Comments from '../Comments';
import { collections, useTerm, useTranslations } from '../dataHooks';
import { FormatDate } from '../FormatDate';
import Header from '../Header';
import { Translation } from '../types';

export default function TermPage() {
    const { termId } = useParams<{ termId: string }>();
    const { t } = useTranslation();
    const [term] = useTerm(termId);
    const [translations] = useTranslations(termId);

    if (!term) {
        return null;
    }

    return (
        <>
            <Header
                subLine={
                    <Trans
                        t={t}
                        i18nKey="term.addedOn"
                        components={{
                            User: 'timur',
                            FormatDate: <FormatDate date={term.createdAt && term.createdAt.toDate()} />,
                        }}
                    />
                }
                mainLang={term.lang}
            >
                {term.value}
            </Header>
            {translations && <TranslationsList termId={termId} translations={translations} />}
            <Comments entityRef={collections.terms.doc(termId)} />
        </>
    );
}

function TranslationsList({ termId, translations }: { termId: string; translations: Translation[] }) {
    return (
        <ul>
            {translations.map(translation => (
                <li key={translation.id}>{translation.value}</li>
            ))}
        </ul>
    );
}
