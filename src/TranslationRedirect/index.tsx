import { generatePath, useParams } from 'react-router-dom';
import { collections } from '../hooks/data';
import { useDocument } from '../hooks/fetch';
import RedirectPath from '../RedirectPath';
import { TRANSLATION } from '../routes';

export default function TranslationRedirect() {
    const { translationId } = useParams<{
        translationId: string;
    }>();
    const getTranslation = useDocument(collections.translations.doc(translationId));
    return <RedirectPath to={generatePath(TRANSLATION, { translationId, termId: getTranslation().term.id })} />;
}
