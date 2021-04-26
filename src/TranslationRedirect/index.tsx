import { generatePath, Redirect, useParams } from 'react-router-dom';
import { collections } from '../hooks/data';
import { useDocument } from '../hooks/fetch';
import { TRANSLATION } from '../routes';

export default function TranslationRedirect() {
    const { translationId } = useParams<{
        translationId: string;
    }>();
    const getTranslation = useDocument(collections.translations.doc(translationId));
    return <Redirect to={generatePath(TRANSLATION, { translationId, termId: getTranslation().term.id })} />;
}
