import { generatePath, useParams } from 'react-router';
import { collections } from '../hooks/data';
import { useDocument } from '../hooks/fetch';
import RedirectPath from '../RedirectPath';
import { TRANSLATION_EXAMPLE } from '../routes';

export default function TranslationExampleRedirect() {
    const { translationExampleId } = useParams<{
        translationExampleId: string;
    }>();
    const getTranslationExample = useDocument(collections.translationExamples.doc(translationExampleId));
    const getTranslation = useDocument(getTranslationExample().translation);
    return (
        <RedirectPath
            to={generatePath(TRANSLATION_EXAMPLE, {
                termId: getTranslation().term.id,
                translationId: getTranslationExample().translation.id,
                translationExampleId: getTranslationExample().id,
            })}
        />
    );
}
