import { useParams } from 'react-router-dom';
import { useTerm, useTranslations } from '../dataHooks';
import Header from '../Header';
import { Translation } from '../types';

export default function TermPage() {
    const { termId } = useParams<{ termId: string }>();
    const [term] = useTerm(termId);
    const [translations] = useTranslations(termId);

    if (!term) {
        return null;
    }

    return (
        <>
            <Header>{term.value}</Header>
            {translations && <TranslationsList termId={termId} translations={translations} />}
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
